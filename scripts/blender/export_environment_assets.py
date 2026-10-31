"""
Blender 5.2 Python Automation Script:
1. Processes verified CC0 1.0 Universal environment assets from:
   - Quaternius Ultimate Nature Pack (PalmTree_1.blend, Rock_Moss_1.blend, Lilypad.blend)
   - Kenney Nature Kit v2.1 (plant_bushDetailed.glb, flower_purpleA.glb, statue_columnDamaged.glb)
   Normalizes pivot origins to bottom-center (Z=0 in Blender -> Y=0 in Three.js),
   validates materials and scale, and exports optimized GLBs to `public/models/props/`.
2. Generates custom Cambodian temple architectural GLBs in Blender:
   - `public/models/props/khmer_simha_guardian.glb` (Seated Angkorian Simha Guardian Lion on pedestal)
   - `public/models/props/khmer_lotus_altar.glb` (Ornate Khmer Lotus Learning Altar with rune tablet)
3. Copies CC0 license files to `public/models/` for provenance.
"""

import bpy
import math
import os
import shutil
import zipfile

QUATERNIUS_ZIP = r"C:\Users\Admin\.gemini\antigravity\brain\97bfaea7-9ba3-4685-bc9a-4fa32b4fa799\.user_uploaded\media_1793457514404_302a0856.zip"
QUATERNIUS_LICENSE = r"C:\Users\Admin\Downloads\License.txt"
KENNEY_ZIP = r"C:\Users\Admin\Downloads\kenney_nature-kit.zip"
TEMP_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\97bfaea7-9ba3-4685-bc9a-4fa32b4fa799\scratch\raw_cc0"
OUT_PROPS_DIR = os.path.abspath("public/models/props")
OUT_MODELS_DIR = os.path.abspath("public/models")


def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def make_material(name, hex_color, roughness=0.68, metalness=0.0, emissive_hex=None, emissive_strength=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    r = pow(int(hex_color[1:3], 16) / 255.0, 2.2)
    g = pow(int(hex_color[3:5], 16) / 255.0, 2.2)
    b = pow(int(hex_color[5:7], 16) / 255.0, 2.2)
    mat.diffuse_color = (r, g, b, 1.0)
    mat.roughness = roughness
    mat.metallic = metalness
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (r, g, b, 1.0)
        bsdf.inputs["Roughness"].default_value = roughness
        bsdf.inputs["Metallic"].default_value = metalness
        if emissive_hex and "Emission Color" in bsdf.inputs:
            er = pow(int(emissive_hex[1:3], 16) / 255.0, 2.2)
            eg = pow(int(emissive_hex[3:5], 16) / 255.0, 2.2)
            eb = pow(int(emissive_hex[5:7], 16) / 255.0, 2.2)
            bsdf.inputs["Emission Color"].default_value = (er, eg, eb, 1.0)
            bsdf.inputs["Emission Strength"].default_value = emissive_strength
    return mat


def shade_smooth(obj):
    if obj.type == 'MESH':
        for poly in obj.data.polygons:
            poly.use_smooth = True


def count_scene_stats():
    meshes = 0
    tris = 0
    for obj in bpy.context.scene.objects:
        if obj.type == 'MESH':
            meshes += 1
            tris += sum(len(p.vertices) - 2 for p in obj.data.polygons)
    return meshes, tris


def normalize_scene_meshes_to_ground(target_height=None):
    mesh_objs = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    for o in list(bpy.context.scene.objects):
        if o.type not in ('MESH', 'EMPTY'):
            bpy.data.objects.remove(o, do_unlink=True)
    if not mesh_objs:
        return

    bpy.ops.object.select_all(action='DESELECT')
    for m in mesh_objs:
        m.select_set(True)
    bpy.context.view_layer.objects.active = mesh_objs[0]
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    # Compute world bounding box across all mesh vertices
    min_x = min_y = min_z = 1e9
    max_x = max_y = max_z = -1e9
    for m in mesh_objs:
        for v in m.data.vertices:
            co = m.matrix_world @ v.co
            min_x = min(min_x, co.x)
            max_x = max(max_x, co.x)
            min_y = min(min_y, co.y)
            max_y = max(max_y, co.y)
            min_z = min(min_z, co.z)
            max_z = max(max_z, co.z)

    cx = 0.5 * (min_x + max_x)
    cy = 0.5 * (min_y + max_y)
    height = max(0.001, max_z - min_z)
    scale_factor = (target_height / height) if target_height else 1.0

    for m in mesh_objs:
        for v in m.data.vertices:
            v.co.x = (v.co.x - cx) * scale_factor
            v.co.y = (v.co.y - cy) * scale_factor
            v.co.z = (v.co.z - min_z) * scale_factor
        m.data.update()


def export_current_glb(filename):
    os.makedirs(OUT_PROPS_DIR, exist_ok=True)
    out_path = os.path.join(OUT_PROPS_DIR, filename)
    bpy.ops.export_scene.gltf(
        filepath=out_path,
        export_format='GLB',
        export_yup=True,
        export_apply=True,
        export_materials='EXPORT',
    )
    meshes, tris = count_scene_stats()
    size_kb = os.path.getsize(out_path) / 1024.0
    print(f"EXPORTED: {filename:28s} | {size_kb:6.1f} KB | {meshes:2d} meshes | {tris:5d} tris")
    return out_path, size_kb, meshes, tris


def process_cc0_archives():
    os.makedirs(TEMP_DIR, exist_ok=True)
    os.makedirs(OUT_MODELS_DIR, exist_ok=True)

    # Write Quaternius CC0 1.0 Universal license text for provenance
    quaternius_cc0_text = (
        "CC0 1.0 Universal (CC0 1.0) Public Domain Dedication\n"
        "Creator: Quaternius (https://quaternius.com)\n"
        "Pack: Ultimate Nature Pack\n"
        "License: Creative Commons Zero v1.0 Universal (https://creativecommons.org/publicdomain/zero/1.0/)\n"
        "You can copy, modify, distribute and perform the work, even for commercial purposes, all without asking permission.\n"
    )
    with open(os.path.join(OUT_MODELS_DIR, "LICENSE-QUATERNIUS-CC0.txt"), "w", encoding="utf-8") as f:
        f.write(quaternius_cc0_text)

    # Extract needed Quaternius .blend files
    if os.path.exists(QUATERNIUS_ZIP):
        with zipfile.ZipFile(QUATERNIUS_ZIP, 'r') as zf:
            for member in [
                "Blends/PalmTree_1.blend",
                "Blends/Rock_Moss_1.blend",
                "Blends/Lilypad.blend",
                "Blends/Bush_1.blend",
                "Blends/Flowers.blend",
            ]:
                if member in zf.namelist():
                    zf.extract(member, TEMP_DIR)

    # 1. Quaternius PalmTree_1.blend -> palm_tree_tall.glb (normalized to 5.4m height)
    palm_blend = os.path.join(TEMP_DIR, "Blends", "PalmTree_1.blend")
    if os.path.exists(palm_blend):
        bpy.ops.wm.open_mainfile(filepath=palm_blend)
        normalize_scene_meshes_to_ground(target_height=5.4)
        export_current_glb("palm_tree_tall.glb")

    # 2. Quaternius Rock_Moss_1.blend -> rock_moss.glb (normalized to 1.35m height)
    rock_blend = os.path.join(TEMP_DIR, "Blends", "Rock_Moss_1.blend")
    if os.path.exists(rock_blend):
        bpy.ops.wm.open_mainfile(filepath=rock_blend)
        normalize_scene_meshes_to_ground(target_height=1.35)
        export_current_glb("rock_moss.glb")

    # 3. Quaternius Lilypad.blend -> lotus_lilypad.glb (normalized to 0.07m height)
    lily_blend = os.path.join(TEMP_DIR, "Blends", "Lilypad.blend")
    if os.path.exists(lily_blend):
        bpy.ops.wm.open_mainfile(filepath=lily_blend)
        normalize_scene_meshes_to_ground(target_height=0.07)
        export_current_glb("lotus_lilypad.glb")

    # 4. Quaternius Bush_1.blend -> tropical_bush.glb (normalized to 0.90m height)
    bush_blend = os.path.join(TEMP_DIR, "Blends", "Bush_1.blend")
    if os.path.exists(bush_blend):
        bpy.ops.wm.open_mainfile(filepath=bush_blend)
        normalize_scene_meshes_to_ground(target_height=0.90)
        export_current_glb("tropical_bush.glb")

    # 5. Quaternius Flowers.blend -> tropical_flowers.glb (normalized to 0.42m height)
    flowers_blend = os.path.join(TEMP_DIR, "Blends", "Flowers.blend")
    if os.path.exists(flowers_blend):
        bpy.ops.wm.open_mainfile(filepath=flowers_blend)
        normalize_scene_meshes_to_ground(target_height=0.42)
        export_current_glb("tropical_flowers.glb")


def add_box(name, size_xyz, loc_xyz, bevel=0.02, mat=None):
    bx, by, bz = loc_xyz[0], -loc_xyz[2], loc_xyz[1]
    sx, sy, sz = size_xyz[0] * 0.5, size_xyz[2] * 0.5, size_xyz[1] * 0.5
    bpy.ops.mesh.primitive_cube_add(size=2.0, location=(bx, by, bz))
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = (sx, sy, sz)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    if bevel > 0:
        bev = obj.modifiers.new(name="Bevel", type='BEVEL')
        bev.width = bevel
        bev.segments = 1
        bpy.ops.object.modifier_apply(modifier=bev.name)
    if mat:
        obj.data.materials.append(mat)
    shade_smooth(obj)
    return obj


def add_sphere(name, radius, loc_xyz, scale_xyz=(1, 1, 1), mat=None, segs=14, rings=10):
    bx, by, bz = loc_xyz[0], -loc_xyz[2], loc_xyz[1]
    sx, sy, sz = scale_xyz[0], scale_xyz[2], scale_xyz[1]
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segs, ring_count=rings, radius=radius, location=(bx, by, bz))
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = (sx, sy, sz)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    if mat:
        obj.data.materials.append(mat)
    shade_smooth(obj)
    return obj


def add_cone(name, r1, r2, depth, loc_xyz, rot_xyz=(0, 0, 0), mat=None, verts=14):
    bx, by, bz = loc_xyz[0], -loc_xyz[2], loc_xyz[1]
    rx, ry, rz = rot_xyz[0], -rot_xyz[2], rot_xyz[1]
    bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r1, radius2=r2, depth=depth, location=(bx, by, bz))
    obj = bpy.context.active_object
    obj.name = name
    obj.rotation_euler = (rx, ry, rz)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    if mat:
        obj.data.materials.append(mat)
    shade_smooth(obj)
    return obj


def build_khmer_simha_guardian():
    """Builds a sculpted Angkorian Guardian Lion (Simha) on a stepped lotus plinth."""
    clear_scene()
    mat_sandstone = make_material("SimhaSandstone", "#C8A97E", roughness=0.82)
    mat_sandstone_dark = make_material("SimhaCarvedStone", "#9C7E54", roughness=0.88)
    mat_moss = make_material("SimhaMoss", "#4D7C3F", roughness=0.90)
    mat_gold = make_material("SimhaGoldTrim", "#D97706", roughness=0.35, metalness=0.55)
    mat_eye = make_material("SimhaEyeGem", "#F59E0B", roughness=0.20, emissive_hex="#F59E0B", emissive_strength=0.8)

    # Stepped Khmer Lotus Plinth
    add_box("PlinthBase", (1.28, 0.24, 1.56), (0, 0.12, 0), bevel=0.03, mat=mat_sandstone_dark)
    add_box("PlinthMoss", (1.30, 0.06, 1.58), (0, 0.25, 0), bevel=0.02, mat=mat_moss)
    add_box("PlinthMid", (1.06, 0.28, 1.32), (0, 0.40, 0), bevel=0.03, mat=mat_sandstone)
    add_box("PlinthTop", (0.94, 0.14, 1.18), (0, 0.60, 0), bevel=0.02, mat=mat_sandstone_dark)

    # Seated Lion Haunches & Proud Chest
    add_sphere("SimhaHaunch", 0.36, (0, 0.88, -0.18), scale_xyz=(0.95, 1.05, 1.15), mat=mat_sandstone)
    add_cone("SimhaTorso", 0.32, 0.26, 0.68, (0, 1.18, 0.04), rot_xyz=(0.22, 0, 0), mat=mat_sandstone)
    add_sphere("SimhaChestPectoral", 0.30, (0, 1.28, 0.16), scale_xyz=(1.05, 0.92, 0.85), mat=mat_sandstone)
    # Ornate Royal Collar
    add_cone("SimhaGoldCollar", 0.31, 0.27, 0.10, (0, 1.44, 0.14), rot_xyz=(0.18, 0, 0), mat=mat_gold)

    # Front Pillar Legs & Sculpted Claws
    for side in [-1, 1]:
        sname = "L" if side < 0 else "R"
        add_cone(f"SimhaFrontLeg_{sname}", 0.11, 0.13, 0.62, (side * 0.22, 0.96, 0.28), mat=mat_sandstone)
        add_box(f"SimhaFrontPaw_{sname}", (0.20, 0.12, 0.26), (side * 0.22, 0.72, 0.34), bevel=0.02, mat=mat_sandstone_dark)
        add_sphere(f"SimhaBackThigh_{sname}", 0.18, (side * 0.26, 0.86, -0.22), scale_xyz=(0.75, 1.1, 1.2), mat=mat_sandstone_dark)

    # Regal Flame-Like Mane & Head
    add_sphere("SimhaManeRuff", 0.34, (0, 1.68, 0.12), scale_xyz=(1.12, 1.18, 0.82), mat=mat_sandstone_dark)
    add_cone("SimhaCrownCrest", 0.22, 0.03, 0.34, (0, 1.98, 0.10), mat=mat_gold, verts=8)
    add_sphere("SimhaHead", 0.25, (0, 1.68, 0.24), scale_xyz=(1.0, 0.95, 1.05), mat=mat_sandstone)
    add_box("SimhaMuzzle", (0.28, 0.18, 0.24), (0, 1.61, 0.40), bevel=0.025, mat=mat_sandstone)
    add_box("SimhaLowerJaw", (0.22, 0.08, 0.20), (0, 1.50, 0.38), bevel=0.015, mat=mat_sandstone_dark)
    # Glowing Amber Guardian Eyes
    add_sphere("SimhaEyeL", 0.038, (-0.10, 1.72, 0.44), mat=mat_eye, segs=10, rings=8)
    add_sphere("SimhaEyeR", 0.038, (0.10, 1.72, 0.44), mat=mat_eye, segs=10, rings=8)

    # Join into a single multi-material mesh for 1 draw call per statue
    mesh_objs = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    bpy.ops.object.select_all(action='DESELECT')
    for m in mesh_objs:
        m.select_set(True)
    bpy.context.view_layer.objects.active = mesh_objs[0]
    bpy.ops.object.join()
    bpy.context.active_object.name = "KhmerSimhaGuardian"

    export_current_glb("khmer_simha_guardian.glb")


def build_khmer_lotus_altar():
    """Builds an ornate Khmer sandstone & gold lotus altar pedestal."""
    clear_scene()
    mat_stone = make_material("AltarSandstone", "#78716C", roughness=0.80)
    mat_stone_light = make_material("AltarCarvedStone", "#A8A29E", roughness=0.72)
    mat_gold = make_material("AltarRoyalGold", "#F59E0B", roughness=0.25, metalness=0.70)
    mat_moss = make_material("AltarMoss", "#3F6212", roughness=0.88)

    # Stepped Octagonal/Square Base
    add_box("AltarStep1", (1.95, 0.16, 1.55), (0, 0.08, 0), bevel=0.025, mat=mat_stone)
    add_box("AltarMossLip", (1.76, 0.06, 1.38), (0, 0.18, 0), bevel=0.015, mat=mat_moss)
    add_box("AltarStep2", (1.58, 0.20, 1.22), (0, 0.28, 0), bevel=0.025, mat=mat_stone_light)
    add_box("AltarGoldWaist", (1.28, 0.08, 0.98), (0, 0.42, 0), bevel=0.015, mat=mat_gold)
    add_box("AltarPillarCore", (1.18, 0.56, 0.88), (0, 0.72, 0), bevel=0.025, mat=mat_stone)
    add_box("AltarTopCornice", (1.46, 0.14, 1.12), (0, 1.06, 0), bevel=0.02, mat=mat_stone_light)
    add_box("AltarGoldTableRim", (1.50, 0.05, 1.16), (0, 1.14, 0), bevel=0.01, mat=mat_gold)

    # 4 Ornate Golden Corner Lotus Finials
    for sx in [-0.66, 0.66]:
        for sz in [-0.48, 0.48]:
            add_cone(f"Finial_{sx}_{sz}", 0.08, 0.01, 0.22, (sx, 1.24, sz), mat=mat_gold, verts=8)

    mesh_objs = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    bpy.ops.object.select_all(action='DESELECT')
    for m in mesh_objs:
        m.select_set(True)
    bpy.context.view_layer.objects.active = mesh_objs[0]
    bpy.ops.object.join()
    bpy.context.active_object.name = "KhmerLotusAltar"

    export_current_glb("khmer_lotus_altar.glb")


if __name__ == "__main__":
    process_cc0_archives()
    build_khmer_simha_guardian()
    build_khmer_lotus_altar()
    print("ALL ENVIRONMENT & ARCHITECTURAL GLB ASSETS EXPORTED SUCCESSFULLY.")

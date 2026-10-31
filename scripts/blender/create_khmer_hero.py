"""
Blender 5.2 Python Automation Script:
Generates the stylized 3D Khmer Student Hero (`public/models/characters/khmer_student_hero.glb`)
modeled after the 2D concept art `src/assets/profile/khmer-typing-hero-avatar.png`.

Coordinate mapping (Blender -> glTF 2.0 / Three.js with export_yup=True):
  Blender +X -> Three.js +X (Right)
  Blender +Z -> Three.js +Y (Up, ground = 0)
  Blender -Y -> Three.js +Z (Forward)
"""

import bpy
import bmesh
import math
import os


def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def make_material(name, hex_color, roughness=0.58, metalness=0.0, emissive_hex=None, emissive_strength=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    r = int(hex_color[1:3], 16) / 255.0
    g = int(hex_color[3:5], 16) / 255.0
    b = int(hex_color[5:7], 16) / 255.0
    r_lin = pow(r, 2.2)
    g_lin = pow(g, 2.2)
    b_lin = pow(b, 2.2)
    mat.diffuse_color = (r_lin, g_lin, b_lin, 1.0)
    mat.roughness = roughness
    mat.metallic = metalness
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (r_lin, g_lin, b_lin, 1.0)
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


def create_empty(name, loc_xyz, parent=None):
    bx, by, bz = loc_xyz[0], -loc_xyz[2], loc_xyz[1]
    empty = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(empty)
    if parent:
        empty.parent = parent
    empty.location = (bx, by, bz)
    return empty


def add_uv_sphere(name, radius, loc_xyz, scale_xyz=(1, 1, 1), rot_xyz=(0, 0, 0), mat=None, parent=None, segments=16, rings=12):
    bx, by, bz = loc_xyz[0], -loc_xyz[2], loc_xyz[1]
    sx, sy, sz = scale_xyz[0], scale_xyz[2], scale_xyz[1]
    rx, ry, rz = rot_xyz[0], -rot_xyz[2], rot_xyz[1]

    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, radius=radius, location=(0, 0, 0))
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = (sx, sy, sz)
    obj.rotation_euler = (rx, ry, rz)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)

    if parent:
        obj.parent = parent
    obj.location = (bx, by, bz)
    if mat:
        obj.data.materials.append(mat)
    shade_smooth(obj)
    return obj


def add_cylinder(name, r1, r2, depth, loc_xyz, scale_xyz=(1, 1, 1), rot_xyz=(0, 0, 0), mat=None, parent=None, vertices=16):
    bx, by, bz = loc_xyz[0], -loc_xyz[2], loc_xyz[1]
    sx, sy, sz = scale_xyz[0], scale_xyz[2], scale_xyz[1]
    rx, ry, rz = rot_xyz[0], -rot_xyz[2], rot_xyz[1]

    bpy.ops.mesh.primitive_cone_add(vertices=vertices, radius1=r1, radius2=r2, depth=depth, location=(0, 0, 0))
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = (sx, sy, sz)
    obj.rotation_euler = (rx, ry, rz)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)

    if parent:
        obj.parent = parent
    obj.location = (bx, by, bz)
    if mat:
        obj.data.materials.append(mat)
    shade_smooth(obj)
    return obj


def add_beveled_box(name, size_xyz, loc_xyz, rot_xyz=(0, 0, 0), bevel_width=0.018, mat=None, parent=None):
    bx, by, bz = loc_xyz[0], -loc_xyz[2], loc_xyz[1]
    sx, sy, sz = size_xyz[0] * 0.5, size_xyz[2] * 0.5, size_xyz[1] * 0.5
    rx, ry, rz = rot_xyz[0], -rot_xyz[2], rot_xyz[1]

    bpy.ops.mesh.primitive_cube_add(size=2.0, location=(0, 0, 0))
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = (sx, sy, sz)
    obj.rotation_euler = (rx, ry, rz)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)

    if bevel_width > 0:
        bev = obj.modifiers.new(name="Bevel", type='BEVEL')
        bev.width = bevel_width
        bev.segments = 1
        bpy.ops.object.modifier_apply(modifier=bev.name)

    if parent:
        obj.parent = parent
    obj.location = (bx, by, bz)
    if mat:
        obj.data.materials.append(mat)
    shade_smooth(obj)
    return obj


def add_hair_lock(name, radius, length, loc_xyz, rot_xyz, curve_bend=0.06, mat=None, parent=None):
    bx, by, bz = loc_xyz[0], -loc_xyz[2], loc_xyz[1]
    rx, ry, rz = rot_xyz[0], -rot_xyz[2], rot_xyz[1]

    bpy.ops.mesh.primitive_cone_add(vertices=10, radius1=radius, radius2=0.008, depth=length, location=(0, 0, 0))
    obj = bpy.context.active_object
    obj.name = name

    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bmesh.ops.subdivide_edges(bm, edges=bm.edges, cuts=1, use_grid_fill=True)
    for v in bm.verts:
        t = (v.co.z + length * 0.5) / max(0.001, length)
        # Flatten slightly front-to-back and curve backward (+Y in Blender)
        v.co.y = v.co.y * 0.72 + (t * t) * curve_bend
    bm.to_mesh(obj.data)
    bm.free()

    obj.rotation_euler = (rx, ry, rz)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)

    if parent:
        obj.parent = parent
    obj.location = (bx, by, bz)
    if mat:
        obj.data.materials.append(mat)
    shade_smooth(obj)
    return obj


def join_direct_mesh_children(empty_parent, joined_name):
    mesh_children = [c for c in empty_parent.children if c.type == 'MESH']
    if not mesh_children:
        return None
    bpy.ops.object.select_all(action='DESELECT')
    for m in mesh_children:
        m.select_set(True)
    bpy.context.view_layer.objects.active = mesh_children[0]
    if len(mesh_children) > 1:
        bpy.ops.object.join()
    joined = bpy.context.active_object
    joined.name = joined_name
    # Reset origin to empty_parent's world location so local offset is (0, 0, 0)
    saved_cursor = tuple(bpy.context.scene.cursor.location)
    bpy.context.scene.cursor.location = empty_parent.matrix_world.translation
    bpy.ops.object.origin_set(type='ORIGIN_CURSOR')
    bpy.context.scene.cursor.location = saved_cursor
    return joined


def build_khmer_hero():
    clear_scene()

    # Palette matched to src/assets/profile/khmer-typing-hero-avatar.png
    mat_skin = make_material("SkinWarmTan", "#E2A373", roughness=0.62)
    mat_skin_blush = make_material("SkinCheek", "#E07A5F", roughness=0.68)
    mat_hair = make_material("HairDarkEspresso", "#1D130E", roughness=0.52)
    mat_hair_hi = make_material("HairHighlight", "#362218", roughness=0.48)
    mat_teal_tunic = make_material("TealTunic", "#0F766E", roughness=0.58)
    mat_teal_dark = make_material("TealScarf", "#0B534E", roughness=0.62)
    mat_gold = make_material("RoyalGold", "#F59E0B", roughness=0.26, metalness=0.68)
    mat_gold_bright = make_material("BrightGold", "#FBBF24", roughness=0.20, metalness=0.75)
    mat_gem_blue = make_material("SapphireGem", "#38BDF8", roughness=0.10, metalness=0.10, emissive_hex="#0284C7", emissive_strength=1.4)
    mat_kben = make_material("ChongKbenAmber", "#9A4212", roughness=0.68)
    mat_leather = make_material("DarkLeather", "#4A2511", roughness=0.76)
    mat_scroll = make_material("PalmScroll", "#FEF3C7", roughness=0.52)
    mat_crimson = make_material("CrimsonSilk", "#DC2626", roughness=0.48)
    mat_eye_white = make_material("EyeSclera", "#FFFFFF", roughness=0.12)
    mat_eye_iris = make_material("EyeIrisBrown", "#6D3714", roughness=0.18)
    mat_eye_pupil = make_material("EyePupil", "#0F172A", roughness=0.08)
    mat_eye_sparkle = make_material("EyeCatchlight", "#FFFFFF", roughness=0.0, emissive_hex="#FFFFFF", emissive_strength=1.2)

    # Root hierarchy matching Character.tsx animated groups
    hero_root = create_empty("HeroRoot", (0, 0, 0))
    body_node = create_empty("HeroBody", (0, 0, 0), parent=hero_root)
    chest_node = create_empty("HeroChest", (0, 1.15, 0), parent=body_node)
    # HeroCape is child of HeroChest (local y=0.29, z=-0.12 -> world y=1.44, z=-0.12)
    cape_node = create_empty("HeroCape", (0, 0.29, -0.12), parent=chest_node)
    head_node = create_empty("HeroHead", (0, 1.72, 0), parent=body_node)
    left_arm_node = create_empty("HeroLeftArm", (-0.34, 1.38, 0), parent=body_node)
    right_arm_node = create_empty("HeroRightArm", (0.34, 1.38, 0), parent=body_node)
    left_leg_node = create_empty("HeroLeftLeg", (-0.15, 0.78, 0), parent=hero_root)
    right_leg_node = create_empty("HeroRightLeg", (0.15, 0.78, 0), parent=hero_root)

    # ===== 1. CHEST & TUNIC (Relative to HeroChest at y=1.15) =====
    # Athletic tapered torso (wider at chest, trim at waist)
    add_cylinder("TunicUpper", 0.21, 0.26, 0.50, (0, 0.04, 0), scale_xyz=(1.08, 1.0, 0.80), mat=mat_teal_tunic, parent=chest_node)
    # Neck
    add_cylinder("Neck", 0.095, 0.09, 0.16, (0, 0.33, 0), mat=mat_skin, parent=chest_node)

    # Draped Teal Adventurer Scarf Cowl around shoulders + Gold Trim
    add_uv_sphere("ScarfCowl", 0.29, (0, 0.25, 0.01), scale_xyz=(1.10, 0.36, 0.88), rot_xyz=(0.10, 0, 0), mat=mat_teal_dark, parent=chest_node)
    add_uv_sphere("ScarfCowlTrim", 0.30, (0, 0.22, 0.02), scale_xyz=(1.08, 0.14, 0.86), rot_xyz=(0.12, 0, 0), mat=mat_gold, parent=chest_node)

    # Crossed Golden Royal Harness (Sangvar) visible over the teal tunic
    add_beveled_box("SangvarLeft", (0.075, 0.50, 0.43), (0, 0.02, 0.0), rot_xyz=(0, 0, 0.46), bevel_width=0.012, mat=mat_gold, parent=chest_node)
    add_beveled_box("SangvarRight", (0.075, 0.50, 0.43), (0, 0.02, 0.0), rot_xyz=(0, 0, -0.46), bevel_width=0.012, mat=mat_gold, parent=chest_node)

    # Diamond Golden Chest Clasp + Glowing Sapphire Gem (signature 2D Hero Avatar detail)
    add_beveled_box("ChestDiamondFrame", (0.125, 0.125, 0.045), (0, 0.09, 0.215), rot_xyz=(0, 0, math.pi / 4), bevel_width=0.010, mat=mat_gold_bright, parent=chest_node)
    add_beveled_box("ChestSapphireGem", (0.068, 0.068, 0.055), (0, 0.09, 0.222), rot_xyz=(0, 0, math.pi / 4), bevel_width=0.008, mat=mat_gem_blue, parent=chest_node)

    # Ornate Golden Shoulder Pauldrons (Layered curved armor plates)
    for side in [-1, 1]:
        sname = "Left" if side < 0 else "Right"
        add_uv_sphere(f"Pauldron{sname}", 0.155, (side * 0.29, 0.23, 0), scale_xyz=(1.12, 0.62, 1.02), rot_xyz=(0, 0, -side * 0.32), mat=mat_gold, parent=chest_node)
        add_uv_sphere(f"PauldronRim{sname}", 0.165, (side * 0.31, 0.18, 0), scale_xyz=(1.06, 0.20, 1.02), rot_xyz=(0, 0, -side * 0.32), mat=mat_gold_bright, parent=chest_node)

    # Flowing Back Capelet (Relative to HeroCape)
    add_beveled_box("FlowingCapeMain", (0.48, 0.58, 0.035), (0, -0.26, -0.06), rot_xyz=(0.18, 0, 0), bevel_width=0.012, mat=mat_teal_dark, parent=cape_node)
    add_beveled_box("FlowingCapeGoldBorder", (0.50, 0.055, 0.040), (0, -0.54, -0.11), rot_xyz=(0.18, 0, 0), bevel_width=0.008, mat=mat_gold, parent=cape_node)

    # Explorer Satchel & Rolled Palm-Leaf Manuscript on Back
    add_beveled_box("SatchelBag", (0.30, 0.32, 0.14), (0, 0.01, -0.22), bevel_width=0.018, mat=mat_leather, parent=chest_node)
    add_beveled_box("SatchelBuckle", (0.07, 0.06, 0.025), (0, 0.01, -0.295), bevel_width=0.005, mat=mat_gold_bright, parent=chest_node)
    add_cylinder("PalmScroll", 0.058, 0.058, 0.44, (0, 0.20, -0.22), rot_xyz=(0, 0, math.pi / 2), mat=mat_scroll, parent=chest_node)
    add_cylinder("ScrollRibbonL", 0.064, 0.064, 0.035, (-0.10, 0.20, -0.22), rot_xyz=(0, 0, math.pi / 2), mat=mat_crimson, parent=chest_node)
    add_cylinder("ScrollRibbonR", 0.064, 0.064, 0.035, (0.10, 0.20, -0.22), rot_xyz=(0, 0, math.pi / 2), mat=mat_crimson, parent=chest_node)

    # ===== 2. WAIST BELT & CHONG KBEN (Relative to HeroBody) =====
    add_cylinder("WaistBeltLeather", 0.23, 0.23, 0.11, (0, 0.91, 0), scale_xyz=(1.08, 1.0, 0.84), mat=mat_leather, parent=body_node)
    add_cylinder("WaistBeltGold", 0.238, 0.238, 0.042, (0, 0.91, 0), scale_xyz=(1.08, 1.0, 0.85), mat=mat_gold, parent=body_node)
    # Circular Gold Medallion Buckle with Blue Gem
    add_cylinder("BeltMedallion", 0.072, 0.072, 0.04, (0, 0.91, 0.20), rot_xyz=(math.pi / 2, 0, 0), mat=mat_gold_bright, parent=body_node)
    add_uv_sphere("BeltGem", 0.030, (0, 0.91, 0.22), mat=mat_gem_blue, parent=body_node, segments=10, rings=8)

    # Pleated Chong Kben Hip Wrap & Front Brocade Apron
    add_uv_sphere("ChongKbenHips", 0.26, (0, 0.79, 0), scale_xyz=(1.08, 0.56, 0.84), mat=mat_kben, parent=body_node)
    add_beveled_box("FrontBrocadePanel", (0.15, 0.30, 0.045), (0, 0.73, 0.215), rot_xyz=(0.06, 0, 0), bevel_width=0.008, mat=mat_teal_tunic, parent=body_node)
    add_beveled_box("FrontBrocadeGoldTrim", (0.165, 0.05, 0.050), (0, 0.58, 0.226), rot_xyz=(0.06, 0, 0), bevel_width=0.006, mat=mat_gold_bright, parent=body_node)
    add_beveled_box("FrontBrocadeDiamond", (0.065, 0.065, 0.050), (0, 0.74, 0.222), rot_xyz=(0.06, 0, math.pi / 4), bevel_width=0.005, mat=mat_gold, parent=body_node)

    # ===== 3. HEAD, EXPRESSIVE FACE, SPIKY HAIR & SAPPHIRE DIADEM (Relative to HeroHead at y=1.72) =====
    # Smooth Stylized Youth Head
    add_uv_sphere("HeadSkull", 0.26, (0, 0.02, 0), scale_xyz=(1.02, 1.02, 0.95), mat=mat_skin, parent=head_node, segments=20, rings=16)
    # Soft flush cheek blush ovals (flush with face, not bulging out)
    add_uv_sphere("CheekLeft", 0.052, (-0.145, -0.045, 0.215), scale_xyz=(1.1, 0.65, 0.25), rot_xyz=(0, -0.45, 0), mat=mat_skin_blush, parent=head_node, segments=10, rings=8)
    add_uv_sphere("CheekRight", 0.052, (0.145, -0.045, 0.215), scale_xyz=(1.1, 0.65, 0.25), rot_xyz=(0, 0.45, 0), mat=mat_skin_blush, parent=head_node, segments=10, rings=8)
    # Cute Sculpted Nose
    add_uv_sphere("Nose", 0.030, (0, -0.02, 0.255), scale_xyz=(0.95, 0.80, 1.05), mat=mat_skin, parent=head_node, segments=10, rings=8)
    # Ears
    add_uv_sphere("EarLeft", 0.058, (-0.255, 0.0, -0.01), scale_xyz=(0.48, 1.10, 0.75), mat=mat_skin, parent=head_node, segments=10, rings=8)
    add_uv_sphere("EarRight", 0.058, (0.255, 0.0, -0.01), scale_xyz=(0.48, 1.10, 0.75), mat=mat_skin, parent=head_node, segments=10, rings=8)

    # Large Expressive Eyes (Sclera + Brown Iris + Dark Pupil + Dual Catchlights)
    for side in [-1, 1]:
        sname = "L" if side < 0 else "R"
        ex = side * 0.098
        add_uv_sphere(f"EyeSclera_{sname}", 0.056, (ex, 0.01, 0.215), scale_xyz=(1.02, 1.12, 0.45), mat=mat_eye_white, parent=head_node, segments=12, rings=10)
        add_uv_sphere(f"EyeIris_{sname}", 0.042, (ex, 0.01, 0.232), scale_xyz=(1.0, 1.10, 0.38), mat=mat_eye_iris, parent=head_node, segments=12, rings=10)
        add_uv_sphere(f"EyePupil_{sname}", 0.026, (ex, 0.01, 0.244), scale_xyz=(1.0, 1.10, 0.35), mat=mat_eye_pupil, parent=head_node, segments=10, rings=8)
        add_uv_sphere(f"EyeHighlightBig_{sname}", 0.012, (ex - side * 0.013, 0.030, 0.254), mat=mat_eye_sparkle, parent=head_node, segments=8, rings=6)
        add_uv_sphere(f"EyeHighlightSmall_{sname}", 0.007, (ex + side * 0.014, -0.010, 0.252), mat=mat_eye_sparkle, parent=head_node, segments=8, rings=6)
        # Expressive Thick Eyebrows
        add_beveled_box(f"Eyebrow_{sname}", (0.092, 0.024, 0.026), (ex, 0.088, 0.232), rot_xyz=(0, -side * 0.22, -side * 0.12), bevel_width=0.005, mat=mat_hair, parent=head_node)

    # Cheerful Upward-Curved Smile
    add_beveled_box("SmileCenter", (0.050, 0.014, 0.018), (0, -0.095, 0.238), bevel_width=0.004, mat=mat_leather, parent=head_node)
    add_beveled_box("SmileCornerL", (0.030, 0.014, 0.018), (-0.034, -0.089, 0.234), rot_xyz=(0, -0.2, -0.32), bevel_width=0.004, mat=mat_leather, parent=head_node)
    add_beveled_box("SmileCornerR", (0.030, 0.014, 0.018), (0.034, -0.089, 0.234), rot_xyz=(0, 0.2, 0.32), bevel_width=0.004, mat=mat_leather, parent=head_node)

    # Ornate Golden Headband + Diamond Sapphire Diadem Crest
    add_cylinder("HeadbandTealCloth", 0.268, 0.268, 0.072, (0, 0.115, 0), scale_xyz=(1.02, 1.0, 0.96), mat=mat_teal_dark, parent=head_node)
    add_cylinder("HeadbandGoldBand", 0.273, 0.273, 0.048, (0, 0.115, 0), scale_xyz=(1.02, 1.0, 0.96), mat=mat_gold, parent=head_node)
    # Diamond Forehead Crest (Matching 2D Hero Avatar's signature golden diamond + blue gem)
    add_beveled_box("DiademDiamondGold", (0.135, 0.155, 0.042), (0, 0.135, 0.262), rot_xyz=(0, 0, math.pi / 4), bevel_width=0.010, mat=mat_gold_bright, parent=head_node)
    add_beveled_box("DiademSapphireGem", (0.072, 0.084, 0.050), (0, 0.135, 0.270), rot_xyz=(0, 0, math.pi / 4), bevel_width=0.007, mat=mat_gem_blue, parent=head_node)
    # Headband Tie Ribbon Tails at back-left
    add_beveled_box("HeadbandTail1", (0.055, 0.20, 0.02), (-0.17, 0.04, -0.24), rot_xyz=(0.3, 0, 0.5), bevel_width=0.005, mat=mat_teal_dark, parent=head_node)
    add_beveled_box("HeadbandTail2", (0.048, 0.16, 0.02), (-0.22, 0.08, -0.22), rot_xyz=(0.2, 0, 0.8), bevel_width=0.005, mat=mat_teal_tunic, parent=head_node)

    # Voluminous Layered Spiky Hair (Matching 2D Hero Avatar)
    add_uv_sphere("HairBaseCap", 0.272, (0, 0.125, -0.035), scale_xyz=(1.05, 0.96, 0.98), mat=mat_hair, parent=head_node, segments=18, rings=14)
    # Sculpted hair volume tufts on top of crown
    add_uv_sphere("HairTopVolume", 0.23, (0, 0.22, -0.01), scale_xyz=(1.15, 0.85, 1.05), mat=mat_hair, parent=head_node, segments=14, rings=10)
    # Sleek tapered sideburns framing temples just behind ears/cheeks
    add_uv_sphere("HairTempleL", 0.055, (-0.235, 0.05, 0.08), scale_xyz=(0.45, 1.35, 0.75), rot_xyz=(0.18, 0.25, 0.08), mat=mat_hair, parent=head_node, segments=10, rings=8)
    add_uv_sphere("HairTempleR", 0.055, (0.235, 0.05, 0.08), scale_xyz=(0.45, 1.35, 0.75), rot_xyz=(0.18, -0.25, -0.08), mat=mat_hair, parent=head_node, segments=10, rings=8)

    hair_locks = [
        # Crown sweeping spikes (tilted upward and sweeping right/left/back like 2D avatar)
        ("HairCrownCenter", 0.12, 0.30, (0.02, 0.34, 0.03), (-0.25, 0.0, -0.22), 0.06, mat_hair),
        ("HairCrownLeft1", 0.11, 0.32, (-0.09, 0.33, 0.01), (-0.20, 0.0, 0.35), 0.07, mat_hair_hi),
        ("HairCrownRight1", 0.11, 0.30, (0.11, 0.31, -0.02), (-0.22, 0.0, -0.46), 0.06, mat_hair),
        ("HairCrownLeft2", 0.10, 0.28, (-0.17, 0.27, -0.03), (-0.18, 0.0, 0.65), 0.05, mat_hair),
        ("HairCrownRight2", 0.10, 0.27, (0.18, 0.26, -0.03), (-0.18, 0.0, -0.68), 0.05, mat_hair_hi),
        # Side swept locks above ears
        ("HairSideL1", 0.085, 0.24, (-0.25, 0.18, 0.02), (-0.10, 0.0, 0.92), 0.04, mat_hair),
        ("HairSideL2", 0.075, 0.21, (-0.26, 0.09, -0.04), (-0.15, 0.0, 1.15), 0.04, mat_hair_hi),
        ("HairSideR1", 0.085, 0.24, (0.25, 0.18, 0.02), (-0.10, 0.0, -0.92), 0.04, mat_hair),
        ("HairSideR2", 0.075, 0.21, (0.26, 0.09, -0.04), (-0.15, 0.0, -1.15), 0.04, mat_hair_hi),
        # Back nape spikes
        ("HairBack1", 0.10, 0.25, (0, 0.14, -0.25), (-0.85, 0, 0), 0.05, mat_hair),
        ("HairBack2", 0.085, 0.22, (-0.13, 0.11, -0.23), (-0.75, 0, 0.42), 0.04, mat_hair),
        ("HairBack3", 0.085, 0.22, (0.13, 0.11, -0.23), (-0.75, 0, -0.42), 0.04, mat_hair),
    ]
    for hname, hrad, hlen, hloc, hrot, hbend, hmat in hair_locks:
        add_hair_lock(hname, hrad, hlen, hloc, hrot, curve_bend=hbend, mat=hmat, parent=head_node)

    # ===== 4. LEFT & RIGHT ARMS WITH GOLDEN VAMBRACES =====
    for side, arm_parent in [(-1, left_arm_node), (1, right_arm_node)]:
        sname = "L" if side < 0 else "R"
        add_cylinder(f"UpperSleeve_{sname}", 0.082, 0.092, 0.20, (0, -0.10, 0), mat=mat_teal_tunic, parent=arm_parent)
        add_cylinder(f"SleeveGoldTrim_{sname}", 0.088, 0.088, 0.028, (0, -0.19, 0), mat=mat_gold, parent=arm_parent)
        add_cylinder(f"Forearm_{sname}", 0.068, 0.078, 0.22, (0, -0.30, 0), mat=mat_skin, parent=arm_parent)
        add_cylinder(f"VambraceLeather_{sname}", 0.075, 0.080, 0.12, (0, -0.34, 0), mat=mat_leather, parent=arm_parent)
        add_cylinder(f"VambraceGoldTop_{sname}", 0.082, 0.082, 0.026, (0, -0.28, 0), mat=mat_gold_bright, parent=arm_parent)
        add_cylinder(f"VambraceGoldBot_{sname}", 0.078, 0.078, 0.026, (0, -0.40, 0), mat=mat_gold_bright, parent=arm_parent)
        add_uv_sphere(f"HandPalm_{sname}", 0.066, (0, -0.46, 0.01), scale_xyz=(0.85, 1.05, 0.95), mat=mat_skin, parent=arm_parent, segments=12, rings=10)
        add_uv_sphere(f"HandThumb_{sname}", 0.028, (-side * 0.048, -0.45, 0.04), mat=mat_skin, parent=arm_parent, segments=8, rings=6)

    # ===== 5. LEFT & RIGHT LEGS WITH CHONG KBEN, GOLDEN ANKLE CUFFS & SANDALS =====
    for side, leg_parent in [(-1, left_leg_node), (1, right_leg_node)]:
        sname = "L" if side < 0 else "R"
        add_cylinder(f"LegKben_{sname}", 0.10, 0.12, 0.34, (0, -0.17, 0), mat=mat_kben, parent=leg_parent)
        add_cylinder(f"KneeGoldBand_{sname}", 0.104, 0.104, 0.032, (0, -0.33, 0), mat=mat_gold, parent=leg_parent)
        add_cylinder(f"CalfSkin_{sname}", 0.074, 0.088, 0.28, (0, -0.47, 0), mat=mat_skin, parent=leg_parent)
        add_cylinder(f"AnkleCuff_{sname}", 0.085, 0.085, 0.045, (0, -0.57, 0), mat=mat_gold_bright, parent=leg_parent)
        add_beveled_box(f"SandalSole_{sname}", (0.125, 0.055, 0.23), (0, -0.66, 0.035), bevel_width=0.010, mat=mat_leather, parent=leg_parent)
        add_beveled_box(f"SandalGoldStrap_{sname}", (0.13, 0.028, 0.075), (0, -0.62, 0.045), bevel_width=0.005, mat=mat_gold, parent=leg_parent)

    # Join static child meshes per articulated Empty node so the GLB has only 8 clean multi-material meshes!
    join_direct_mesh_children(cape_node, "HeroCapeMesh")
    join_direct_mesh_children(chest_node, "HeroChestMesh")
    join_direct_mesh_children(body_node, "HeroWaistMesh")
    join_direct_mesh_children(head_node, "HeroHeadMesh")
    join_direct_mesh_children(left_arm_node, "HeroLeftArmMesh")
    join_direct_mesh_children(right_arm_node, "HeroRightArmMesh")
    join_direct_mesh_children(left_leg_node, "HeroLeftLegMesh")
    join_direct_mesh_children(right_leg_node, "HeroRightLegMesh")

    # Count total triangles
    total_tris = 0
    mesh_count = 0
    for obj in bpy.context.scene.objects:
        if obj.type == 'MESH':
            mesh_count += 1
            total_tris += sum(len(p.vertices) - 2 for p in obj.data.polygons)

    out_dir = os.path.abspath("public/models/characters")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "khmer_student_hero.glb")

    bpy.ops.export_scene.gltf(
        filepath=out_path,
        export_format='GLB',
        export_yup=True,
        export_apply=True,
        export_materials='EXPORT',
    )
    size_kb = os.path.getsize(out_path) / 1024.0
    print(f"SUCCESS: Exported {out_path} ({size_kb:.1f} KB, {mesh_count} meshes, {total_tris} triangles)")

    # Remove any old preview inside public/models/characters
    old_preview = os.path.join(out_dir, "khmer_hero_preview.png")
    if os.path.exists(old_preview):
        os.remove(old_preview)

    # Render a preview image for visual inspection
    preview_path = r"C:\Users\Admin\.gemini\antigravity\brain\97bfaea7-9ba3-4685-bc9a-4fa32b4fa799\scratch\khmer_hero_preview.png"
    os.makedirs(os.path.dirname(preview_path), exist_ok=True)
    bpy.ops.object.camera_add(location=(1.15, -2.85, 1.32), rotation=(math.radians(84), 0, math.radians(22)))
    cam = bpy.context.active_object
    bpy.context.scene.camera = cam

    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_WORKBENCH'
    scene.display.shading.light = 'STUDIO'
    scene.display.shading.color_type = 'MATERIAL'
    scene.render.resolution_x = 720
    scene.render.resolution_y = 720
    scene.render.filepath = preview_path
    bpy.ops.render.render(write_still=True)
    print(f"Rendered preview to {preview_path}")


if __name__ == "__main__":
    build_khmer_hero()

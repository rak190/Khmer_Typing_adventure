"""
build_game_ready_hero_v3.py
===========================
Definitive High-Fidelity 3D Stylized Khmer Student Hero Generator.
Refined for Master Task 6.5A - Studio Quality Polish.
"""

import bpy
import bmesh
import math
import os
from mathutils import Vector, Euler, Matrix

OUTPUT_GLB = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "public", "models", "characters", "khmer_student_hero.glb")
)
ARTIFACT_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\97bfaea7-9ba3-4685-bc9a-4fa32b4fa799"
SCRATCH_DIR = os.path.join(ARTIFACT_DIR, "scratch")


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.unit_settings.system = 'METRIC'
    scene.unit_settings.scale_length = 1.0
    scene.render.engine = 'BLENDER_EEVEE'
    scene.render.resolution_x = 1024
    scene.render.resolution_y = 1024
    scene.render.film_transparent = True
    return scene


def hex_to_rgb(h):
    h = h.lstrip('#')
    r = int(h[0:2], 16) / 255.0
    g = int(h[2:4], 16) / 255.0
    b = int(h[4:6], 16) / 255.0
    return (r ** 2.2, g ** 2.2, b ** 2.2, 1.0)


def create_pbr_mat(name, hex_color, metallic=0.0, roughness=0.5, sss_weight=0.0, sss_radius=(0.85, 0.48, 0.32), emission_hex=None, emission_strength=1.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if not bsdf:
        return mat

    bsdf.inputs["Base Color"].default_value = hex_to_rgb(hex_color)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness

    if sss_weight > 0:
        if "Subsurface Weight" in bsdf.inputs:
            bsdf.inputs["Subsurface Weight"].default_value = sss_weight
            if "Subsurface Radius" in bsdf.inputs:
                bsdf.inputs["Subsurface Radius"].default_value = sss_radius
        elif "Subsurface" in bsdf.inputs:
            bsdf.inputs["Subsurface"].default_value = sss_weight

    if emission_hex:
        em_rgba = hex_to_rgb(emission_hex)
        if "Emission Color" in bsdf.inputs:
            bsdf.inputs["Emission Color"].default_value = em_rgba
        elif "Emission" in bsdf.inputs:
            bsdf.inputs["Emission"].default_value = em_rgba
        if "Emission Strength" in bsdf.inputs:
            bsdf.inputs["Emission Strength"].default_value = emission_strength

    return mat


def set_smooth(obj):
    if obj and obj.type == 'MESH':
        for poly in obj.data.polygons:
            poly.use_smooth = True


def apply_all_modifiers(obj):
    if not obj or obj.type != 'MESH':
        return
    bpy.context.view_layer.objects.active = obj
    for mod in list(obj.modifiers):
        try:
            bpy.ops.object.modifier_apply(modifier=mod.name)
        except Exception:
            pass


def make_subdivided_box(name, dim, loc, rot=(0, 0, 0), mat=None, subsurf=2):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=loc, rotation=rot)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = dim
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    if subsurf > 0:
        mod = obj.modifiers.new(name="Subsurf", type='SUBSURF')
        mod.levels = subsurf
        mod.render_levels = subsurf
        apply_all_modifiers(obj)
    set_smooth(obj)
    if mat:
        obj.data.materials.append(mat)
    return obj


def make_beveled_box(name, dim, loc, rot=(0, 0, 0), mat=None, bevel_width=0.01):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=loc, rotation=rot)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = dim
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    if bevel_width > 0:
        mod = obj.modifiers.new(name="Bevel", type='BEVEL')
        mod.width = bevel_width
        mod.segments = 3
        apply_all_modifiers(obj)
    set_smooth(obj)
    if mat:
        obj.data.materials.append(mat)
    return obj


def make_smooth_sphere(name, radius, loc, scale=(1, 1, 1), rot=(0, 0, 0), mat=None, segments=24, rings=16):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, radius=radius, location=loc, rotation=rot)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    set_smooth(obj)
    if mat:
        obj.data.materials.append(mat)
    return obj


def make_smooth_cylinder(name, radius, depth, loc, rot=(0, 0, 0), scale=(1, 1, 1), mat=None, vertices=20):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=loc, rotation=rot)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    set_smooth(obj)
    if mat:
        obj.data.materials.append(mat)
    return obj


def make_curved_tube(name, points, radii, mat=None, resolution=10):
    curve_data = bpy.data.curves.new(name=f"{name}_Curve", type='CURVE')
    curve_data.dimensions = '3D'
    curve_data.resolution_u = resolution
    curve_data.bevel_depth = radii[0]
    curve_data.bevel_resolution = 4
    curve_data.fill_mode = 'FULL'

    spline = curve_data.splines.new('BEZIER')
    spline.bezier_points.add(len(points) - 1)

    for i, pt in enumerate(points):
        bp = spline.bezier_points[i]
        bp.co = Vector(pt)
        bp.handle_left_type = 'AUTO'
        bp.handle_right_type = 'AUTO'
        bp.radius = radii[i] / (radii[0] + 0.0001)

    curve_obj = bpy.data.objects.new(name, curve_data)
    bpy.context.collection.objects.link(curve_obj)
    bpy.context.view_layer.objects.active = curve_obj
    curve_obj.select_set(True)

    bpy.ops.object.convert(target='MESH')
    mesh_obj = bpy.context.active_object
    set_smooth(mesh_obj)
    if mat:
        mesh_obj.data.materials.append(mat)
    return mesh_obj


def make_flat_ribbon(name, points, widths, thickness=0.004, mat=None, resolution=10):
    curve_data = bpy.data.curves.new(name=f"{name}_Curve", type='CURVE')
    curve_data.dimensions = '3D'
    curve_data.resolution_u = resolution
    curve_data.bevel_depth = thickness
    curve_data.bevel_resolution = 2
    curve_data.fill_mode = 'FULL'

    spline = curve_data.splines.new('BEZIER')
    spline.bezier_points.add(len(points) - 1)

    for i, pt in enumerate(points):
        bp = spline.bezier_points[i]
        bp.co = Vector(pt)
        bp.handle_left_type = 'AUTO'
        bp.handle_right_type = 'AUTO'
        bp.radius = widths[i] / (widths[0] + 0.0001)

    curve_obj = bpy.data.objects.new(name, curve_data)
    bpy.context.collection.objects.link(curve_obj)
    bpy.context.view_layer.objects.active = curve_obj
    curve_obj.select_set(True)

    bpy.ops.object.convert(target='MESH')
    mesh_obj = bpy.context.active_object
    mesh_obj.scale = (1.0, 0.22, 1.0)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    set_smooth(mesh_obj)
    if mat:
        mesh_obj.data.materials.append(mat)
    return mesh_obj


def make_tapered_hair_clump(name, p_root, p_mid, p_tip, radius_root=0.065, radius_mid=0.050, radius_tip=0.010, flatten_x=1.20, flatten_y=0.75, mat=None):
    curve_data = bpy.data.curves.new(name=f"{name}_Curve", type='CURVE')
    curve_data.dimensions = '3D'
    curve_data.resolution_u = 12
    curve_data.bevel_depth = radius_root
    curve_data.bevel_resolution = 4
    curve_data.fill_mode = 'FULL'

    spline = curve_data.splines.new('BEZIER')
    spline.bezier_points.add(2)

    pts = [p_root, p_mid, p_tip]
    radii = [1.0, radius_mid / radius_root, radius_tip / radius_root]

    for i in range(3):
        bp = spline.bezier_points[i]
        bp.co = Vector(pts[i])
        bp.radius = radii[i]
        bp.handle_left_type = 'AUTO'
        bp.handle_right_type = 'AUTO'

    curve_obj = bpy.data.objects.new(name, curve_data)
    bpy.context.collection.objects.link(curve_obj)
    bpy.context.view_layer.objects.active = curve_obj
    curve_obj.select_set(True)

    bpy.ops.object.convert(target='MESH')
    mesh_obj = bpy.context.active_object
    mesh_obj.scale = (flatten_x, flatten_y, 1.0)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    set_smooth(mesh_obj)
    if mat:
        mesh_obj.data.materials.append(mat)
    return mesh_obj


def assemble_modular_part(part_name, obj_list, pivot_loc):
    valid_objs = [o for o in obj_list if o and o.name in bpy.data.objects]
    if not valid_objs:
        return None

    for o in valid_objs:
        apply_all_modifiers(o)

    bpy.ops.object.select_all(action='DESELECT')
    for o in valid_objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = valid_objs[0]

    if len(valid_objs) > 1:
        bpy.ops.object.join()

    joined_mesh = bpy.context.active_object
    joined_mesh.name = part_name

    bpy.context.scene.cursor.location = Vector(pivot_loc)
    bpy.ops.object.origin_set(type='ORIGIN_CURSOR')

    empty = bpy.data.objects.new(f"{part_name}_Root", None)
    empty.location = Vector(pivot_loc)
    bpy.context.collection.objects.link(empty)

    bpy.context.view_layer.update()
    joined_mesh.parent = empty
    joined_mesh.matrix_parent_inverse = empty.matrix_world.inverted()
    bpy.context.view_layer.update()

    return empty, joined_mesh


def build_character():
    print("=== BUILDING POLISHED GAME-READY KHMER STUDENT HERO V3.3 ===")
    reset_scene()

    # Materials Palette
    mat_skin = create_pbr_mat("Mat_HeroSkin", "#F5BA96", roughness=0.38, sss_weight=0.36, sss_radius=(0.85, 0.48, 0.32))
    mat_blush = create_pbr_mat("Mat_HeroBlush", "#EB7C74", roughness=0.55, sss_weight=0.40)
    mat_hair = create_pbr_mat("Mat_HeroHair", "#18110D", roughness=0.28)
    mat_gold = create_pbr_mat("Mat_RoyalGold", "#FFC629", metallic=0.92, roughness=0.20)
    mat_gold_bright = create_pbr_mat("Mat_RoyalGoldBright", "#FFE566", metallic=0.95, roughness=0.14)
    mat_sapphire = create_pbr_mat("Mat_CyanSapphire", "#00E5FF", metallic=0.10, roughness=0.08, emission_hex="#00B4D8", emission_strength=2.2)

    mat_sclera = create_pbr_mat("Mat_EyeSclera", "#FAF8F5", roughness=0.15)
    mat_iris = create_pbr_mat("Mat_EyeIris", "#6D3B16", roughness=0.12)
    mat_pupil = create_pbr_mat("Mat_EyePupil", "#0A0808", roughness=0.08)
    mat_catchlight = create_pbr_mat("Mat_EyeCatchlight", "#FFFFFF", roughness=0.05, emission_hex="#FFFFFF", emission_strength=2.2)
    mat_eyelash = create_pbr_mat("Mat_Eyelash", "#1F1510", roughness=0.50)
    mat_mouth = create_pbr_mat("Mat_Mouth", "#9E3232", roughness=0.45)

    mat_tunic = create_pbr_mat("Mat_CreamTunic", "#EDE3D2", roughness=0.68)
    mat_teal = create_pbr_mat("Mat_KhmerTeal", "#0B756E", roughness=0.52)
    mat_teal_cowl = create_pbr_mat("Mat_TealCowl", "#09645E", roughness=0.48)
    mat_kben = create_pbr_mat("Mat_ChongKbenRed", "#883322", roughness=0.62)
    mat_leather = create_pbr_mat("Mat_LeatherBrown", "#5C3317", roughness=0.45)
    mat_dark_leather = create_pbr_mat("Mat_DarkLeather", "#3B1E0C", roughness=0.40)
    mat_boot_sole = create_pbr_mat("Mat_BootSole", "#22160F", roughness=0.85)

    head_parts = []
    chest_parts = []
    cape_parts = []
    waist_parts = []
    arm_l_parts = []
    arm_r_parts = []
    leg_l_parts = []
    leg_r_parts = []

    # =========================================================================
    # 1. EXPRESSIVE CHIBI HEAD, LARGE EYES & VOLUMINOUS HAIR (Pivot: [0, 0, 1.62])
    # =========================================================================
    # Neck: snug cylinder from z = 1.44 to 1.54, meeting cowl directly
    neck = make_smooth_cylinder("HeroNeck", 0.080, 0.14, (0, 0.01, 1.50), mat=mat_skin, vertices=20)
    head_parts.append(neck)

    # UNIFIED CHIBI HEAD BASE (Seamless, cute sculpted shape)
    # Cranium (Smooth dome at top and back)
    cranium = make_smooth_sphere("HeadCranium", 0.205, (0, 0.05, 1.74), scale=(1.04, 1.00, 1.02), mat=mat_skin, segments=32, rings=22)
    # Face & Jaw (Curving softly to a cute rounded chin at z = 1.52)
    head_face = make_subdivided_box("HeadFace", (0.28, 0.20, 0.24), (0, -0.05, 1.63), mat=mat_skin, subsurf=2)
    head_parts.extend([cranium, head_face])

    # Soft Rosy Blush on Cheeks (Flat oval discs flush on face)
    for s, side in [(-1, 'L'), (1, 'R')]:
        blush = make_smooth_sphere(f"Blush_{side}", 0.036, (s * 0.118, -0.165, 1.60), scale=(1.20, 0.12, 0.65), mat=mat_blush, segments=14, rings=8)
        head_parts.append(blush)

    # Cute Stylized Button Nose
    nose = make_smooth_sphere("NoseTip", 0.020, (0, -0.185, 1.625), scale=(1.05, 0.85, 0.85), mat=mat_skin, segments=14, rings=8)
    head_parts.append(nose)

    # Warm Confident Smile
    smile = make_curved_tube(
        "MouthSmile",
        [(-0.042, -0.155, 1.555), (-0.018, -0.170, 1.542), (0.0, -0.172, 1.540), (0.018, -0.170, 1.542), (0.042, -0.155, 1.555)],
        [0.005, 0.008, 0.009, 0.008, 0.005],
        mat=mat_mouth
    )
    lip_lower = make_smooth_sphere("LipLower", 0.015, (0, -0.162, 1.530), scale=(1.3, 0.35, 0.45), mat=mat_skin, segments=10, rings=6)
    head_parts.extend([smile, lip_lower])

    # Stylized Ears
    for s, side in [(-1, 'L'), (1, 'R')]:
        ear = make_smooth_sphere(f"Ear_{side}", 0.062, (s * 0.215, 0.04, 1.67), scale=(0.35, 0.85, 1.15), rot=(0.08, s * -0.18, s * -0.12), mat=mat_skin, segments=18, rings=12)
        head_parts.append(ear)

    # -------------------------------------------------------------------------
    # LARGE, VIBRANT ANIME EYES
    # -------------------------------------------------------------------------
    for s, side in [(-1, 'L'), (1, 'R')]:
        ex = s * 0.094
        ey = -0.160
        ez = 1.655

        # Sclera (Eyeball)
        sclera = make_smooth_sphere(f"EyeSclera_{side}", 0.050, (ex, ey, ez), scale=(0.95, 0.35, 1.05), mat=mat_sclera, segments=22, rings=16)

        # Iris (Large amber-brown oval disc)
        iris = make_smooth_sphere(f"EyeIris_{side}", 0.038, (ex + s * 0.002, ey - 0.014, ez), scale=(0.92, 0.10, 1.08), mat=mat_iris, segments=20, rings=12)

        # Pupil (Deep black)
        pupil = make_smooth_sphere(f"EyePupil_{side}", 0.022, (ex + s * 0.002, ey - 0.018, ez), scale=(0.88, 0.08, 1.02), mat=mat_pupil, segments=16, rings=10)

        # Dual Specular Highlights
        sp1 = make_smooth_sphere(f"Catchlight1_{side}", 0.009, (ex + s * 0.002 - 0.010, ey - 0.022, ez + 0.013), mat=mat_catchlight, segments=10, rings=6)
        sp2 = make_smooth_sphere(f"Catchlight2_{side}", 0.005, (ex + s * 0.002 + 0.008, ey - 0.020, ez - 0.011), mat=mat_catchlight, segments=8, rings=6)

        # Sleek Anime Eyelash
        lash_pts = [
            (ex - s * 0.046, ey - 0.004, ez + 0.026),
            (ex, ey - 0.016, ez + 0.046),
            (ex + s * 0.044, ey - 0.008, ez + 0.038),
            (ex + s * 0.056, ey + 0.002, ez + 0.044),
        ]
        eyelash = make_curved_tube(f"Eyelash_{side}", lash_pts, [0.008, 0.012, 0.010, 0.004], mat=mat_eyelash)

        # Sharp, Confident Eyebrow
        eb_pts = [
            (ex - s * 0.042, ey - 0.010, ez + 0.068),
            (ex, ey - 0.020, ez + 0.086),
            (ex + s * 0.040, ey - 0.006, ez + 0.072),
        ]
        eyebrow = make_curved_tube(f"Eyebrow_{side}", eb_pts, [0.008, 0.013, 0.006], mat=mat_eyelash)

        head_parts.extend([sclera, iris, pupil, sp1, sp2, eyelash, eyebrow])

    # -------------------------------------------------------------------------
    # VOLUMINOUS SCULPTED DARK ANIME HAIR
    # -------------------------------------------------------------------------
    hair_cap = make_smooth_sphere("HairCap", 0.210, (0, 0.08, 1.76), scale=(1.04, 0.82, 1.02), mat=mat_hair, segments=32, rings=22)
    nape_cap = make_subdivided_box("HairNapeCap", (0.30, 0.20, 0.22), (0, 0.14, 1.58), mat=mat_hair, subsurf=2)
    head_parts.extend([hair_cap, nape_cap])

    # 1. Forehead Bangs
    bangs_specs = [
        ("BangCenterL",  (-0.02, -0.10, 1.94), (-0.05, -0.16, 1.86), (-0.07, -0.17, 1.77), 0.052, 0.040, 0.010),
        ("BangCenterR",  (0.02, -0.10, 1.94),  (0.05, -0.16, 1.86),  (0.07, -0.17, 1.77),  0.052, 0.040, 0.010),
        ("BangMidL",     (-0.08, -0.08, 1.92), (-0.12, -0.14, 1.84), (-0.14, -0.14, 1.75), 0.048, 0.038, 0.010),
        ("BangMidR",     (0.08, -0.08, 1.92),  (0.12, -0.14, 1.84),  (0.14, -0.14, 1.75),  0.048, 0.038, 0.010),
        ("BangOuterL",   (-0.15, -0.05, 1.88), (-0.18, -0.10, 1.78), (-0.20, -0.09, 1.68), 0.046, 0.036, 0.008),
        ("BangOuterR",   (0.15, -0.05, 1.88),  (0.19, -0.10, 1.78),  (0.20, -0.09, 1.68),  0.046, 0.036, 0.008),
    ]
    for bname, p0, p1, p2, r0, r1, r2 in bangs_specs:
        strand = make_tapered_hair_clump(f"Hair_{bname}", p0, p1, p2, r0, r1, r2, mat=mat_hair)
        head_parts.append(strand)

    # 2. Sideburns & Ear Framing Locks
    side_specs = [
        ("SideburnL1",   (-0.21, -0.02, 1.76), (-0.24, -0.06, 1.64), (-0.22, -0.04, 1.50), 0.050, 0.038, 0.008),
        ("SideburnR1",   (0.21, -0.02, 1.76),  (0.24, -0.06, 1.64),  (0.22, -0.04, 1.50),  0.050, 0.038, 0.008),
        ("SideburnL2",   (-0.24, 0.05, 1.74),  (-0.26, 0.01, 1.62),  (-0.24, 0.01, 1.48), 0.046, 0.034, 0.008),
        ("SideburnR2",   (0.24, 0.05, 1.74),   (0.26, 0.01, 1.62),   (0.24, 0.01, 1.48),  0.046, 0.034, 0.008),
    ]
    for sname, p0, p1, p2, r0, r1, r2 in side_specs:
        strand = make_tapered_hair_clump(f"Hair_{sname}", p0, p1, p2, r0, r1, r2, mat=mat_hair)
        head_parts.append(strand)

    # 3. Crown & Top Volume Clumps
    crown_specs = [
        ("CrownC",       (0.00, -0.02, 1.98),  (0.00, 0.09, 2.08),   (0.00, 0.19, 2.05),   0.075, 0.062, 0.016),
        ("CrownL1",      (-0.10, 0.00, 1.96),  (-0.13, 0.10, 2.06),  (-0.15, 0.20, 2.02),  0.070, 0.058, 0.014),
        ("CrownR1",      (0.10, 0.00, 1.96),   (0.13, 0.10, 2.06),   (0.15, 0.20, 2.02),   0.070, 0.058, 0.014),
        ("CrownL2",      (-0.18, 0.04, 1.92),  (-0.22, 0.14, 1.99),  (-0.24, 0.23, 1.92),  0.065, 0.052, 0.012),
        ("CrownR2",      (0.18, 0.04, 1.92),   (0.22, 0.14, 1.99),   (0.24, 0.23, 1.92),   0.065, 0.052, 0.012),
    ]
    for cname, p0, p1, p2, r0, r1, r2 in crown_specs:
        strand = make_tapered_hair_clump(f"Hair_{cname}", p0, p1, p2, r0, r1, r2, mat=mat_hair)
        head_parts.append(strand)

    # 4. Lush Rear Mane
    nape_specs = [
        ("NapeUpperC",   (0.00, 0.20, 1.92),   (0.00, 0.28, 1.80),   (0.00, 0.27, 1.66),   0.082, 0.070, 0.018),
        ("NapeUpperL",   (-0.11, 0.19, 1.90),  (-0.14, 0.27, 1.78),  (-0.13, 0.26, 1.64),  0.076, 0.064, 0.016),
        ("NapeUpperR",   (0.11, 0.19, 1.90),   (0.14, 0.27, 1.78),   (0.13, 0.26, 1.64),   0.076, 0.064, 0.016),
        ("NapeMidC",     (0.00, 0.22, 1.76),   (0.00, 0.28, 1.64),   (0.00, 0.26, 1.50),   0.080, 0.068, 0.016),
        ("NapeMidL",     (-0.09, 0.21, 1.75),  (-0.12, 0.27, 1.63),  (-0.11, 0.25, 1.49),  0.074, 0.062, 0.014),
        ("NapeMidR",     (0.09, 0.21, 1.75),   (0.12, 0.27, 1.63),   (0.11, 0.25, 1.49),   0.074, 0.062, 0.014),
        ("NapeLowC",     (0.00, 0.19, 1.60),   (0.00, 0.24, 1.50),   (0.00, 0.22, 1.40),   0.072, 0.058, 0.014),
        ("NapeLowL",     (-0.08, 0.18, 1.59),  (-0.10, 0.23, 1.49),  (-0.09, 0.21, 1.39),  0.068, 0.054, 0.012),
        ("NapeLowR",     (0.08, 0.18, 1.59),   (0.10, 0.23, 1.49),   (0.09, 0.21, 1.39),   0.068, 0.054, 0.012),
    ]
    for nname, p0, p1, p2, r0, r1, r2 in nape_specs:
        strand = make_tapered_hair_clump(f"Hair_{nname}", p0, p1, p2, r0, r1, r2, mat=mat_hair)
        head_parts.append(strand)

    # 5. Royal Golden Diadem Band
    diadem_pts = []
    for a in range(21):
        ang = math.pi * 0.16 + (math.pi * 0.68) * (a / 20.0)
        px = math.cos(ang) * 0.240
        py = -math.sin(ang) * 0.180 + 0.01
        pz = 1.765 + math.sin(ang) * 0.016
        diadem_pts.append((px, py, pz))
    diadem_band = make_curved_tube("DiademBand", diadem_pts, [0.014] * len(diadem_pts), mat=mat_gold, resolution=10)
    head_parts.append(diadem_band)

    # Royal Golden Diamond Crest Frame with Glowing Cyan Sapphire
    crest_frame = make_beveled_box("DiademDiamondFrame", (0.060, 0.014, 0.060), (0.0, -0.185, 1.795), (math.radians(-8), 0, math.pi / 4), mat=mat_gold_bright, bevel_width=0.005)
    crest_gem = make_smooth_sphere("DiademSapphireGem", 0.020, (0.0, -0.194, 1.795), scale=(1.0, 0.60, 1.0), mat=mat_sapphire, segments=16, rings=12)
    crest_spire = make_curved_tube("DiademCrownSpire", [(0.0, -0.185, 1.835), (0.0, -0.174, 1.885)], [0.009, 0.003], mat=mat_gold_bright)
    head_parts.extend([crest_frame, crest_gem, crest_spire])

    # Rear Diadem Knot & Fluttering Teal Ribbons
    ribbon_knot = make_smooth_sphere("DiademKnot", 0.022, (0.0, 0.275, 1.745), mat=mat_teal, segments=12, rings=8)
    ribbon_l = make_curved_tube("DiademRibbonL", [(-0.03, 0.28, 1.74), (-0.07, 0.30, 1.62), (-0.08, 0.29, 1.48)], [0.014, 0.011, 0.007], mat=mat_teal)
    ribbon_r = make_curved_tube("DiademRibbonR", [(0.03, 0.28, 1.74), (0.07, 0.30, 1.62), (0.08, 0.29, 1.48)], [0.014, 0.011, 0.007], mat=mat_teal)
    head_parts.extend([ribbon_knot, ribbon_l, ribbon_r])

    # =========================================================================
    # 2. CREAM TUNIC, DRAPED COWL & SANGVAR HARNESS (Pivot: [0, 0, 1.15])
    # =========================================================================
    # Tailored Tunic: Tapered torso (wider at shoulders, tapering to waist)
    tunic_torso = make_subdivided_box("TunicTorso", (0.42, 0.26, 0.44), (0, 0.0, 1.14), mat=mat_tunic, subsurf=2)
    tunic_collar_l = make_curved_tube("TunicCollarL", [(-0.10, -0.13, 1.35), (-0.04, -0.14, 1.27), (0.0, -0.145, 1.20)], [0.012, 0.010, 0.007], mat=mat_gold)
    tunic_collar_r = make_curved_tube("TunicCollarR", [(0.10, -0.13, 1.35), (0.04, -0.14, 1.27), (0.0, -0.145, 1.20)], [0.012, 0.010, 0.007], mat=mat_gold)
    chest_parts.extend([tunic_torso, tunic_collar_l, tunic_collar_r])

    # Draped Teal Cowl / Scarf (Resting at z = 1.44 to meet chin comfortably)
    cowl_pts = []
    for a in range(17):
        ang = (math.pi * 2.0) * (a / 16.0)
        cowl_pts.append((math.cos(ang) * 0.17, math.sin(ang) * 0.14, 1.44 + 0.012 * math.sin(ang * 2.0)))
    cowl_ring = make_curved_tube("TealCowlRing", cowl_pts, [0.042] * len(cowl_pts), mat=mat_teal_cowl, resolution=10)
    chest_parts.append(cowl_ring)

    # Sleek Golden Shoulder Pauldrons
    pauldron_l = make_smooth_sphere("PauldronL", 0.078, (-0.22, 0.0, 1.32), scale=(1.20, 1.05, 0.85), mat=mat_gold, segments=18, rings=12)
    pauldron_r = make_smooth_sphere("PauldronR", 0.078, (0.22, 0.0, 1.32), scale=(1.20, 1.05, 0.85), mat=mat_gold, segments=18, rings=12)
    chest_parts.extend([pauldron_l, pauldron_r])

    # Crossed Royal Golden Sangvar Harness (Diagonal sashes across chest)
    sang_strap_l = make_flat_ribbon(
        "SangvarStrapL",
        [(-0.16, -0.126, 1.30), (-0.08, -0.135, 1.22), (0.0, -0.138, 1.14), (0.08, -0.135, 1.06), (0.16, -0.126, 0.98)],
        [0.032, 0.032, 0.032, 0.032, 0.032],
        thickness=0.005,
        mat=mat_gold
    )
    sang_strap_r = make_flat_ribbon(
        "SangvarStrapR",
        [(0.16, -0.126, 1.30), (0.08, -0.135, 1.22), (0.0, -0.138, 1.14), (-0.08, -0.135, 1.06), (-0.16, -0.126, 0.98)],
        [0.032, 0.032, 0.032, 0.032, 0.032],
        thickness=0.005,
        mat=mat_gold
    )
    chest_parts.extend([sang_strap_l, sang_strap_r])

    # Central Golden Rosette Medallion with Cyan Gem
    medallion_base = make_smooth_cylinder("SangvarMedallionBase", 0.036, 0.014, (0, -0.142, 1.14), rot=(math.radians(90), 0, 0), mat=mat_gold_bright, vertices=16)
    medallion_gem = make_smooth_sphere("SangvarMedallionGem", 0.016, (0, -0.150, 1.14), scale=(1.0, 0.65, 1.0), mat=mat_sapphire, segments=12, rings=8)
    chest_parts.extend([medallion_base, medallion_gem])

    # Adventurer Satchel Bag (Right hip)
    satchel_body = make_beveled_box("SatchelBody", (0.090, 0.155, 0.135), (0.23, -0.02, 0.94), rot=(math.radians(-6), math.radians(12), math.radians(8)), mat=mat_leather, bevel_width=0.012)
    satchel_flap = make_beveled_box("SatchelFlap", (0.095, 0.160, 0.070), (0.23, -0.04, 0.97), rot=(math.radians(-6), math.radians(12), math.radians(8)), mat=mat_dark_leather, bevel_width=0.008)
    satchel_buckle = make_beveled_box("SatchelBuckle", (0.022, 0.008, 0.024), (0.24, -0.09, 0.94), rot=(math.radians(-6), math.radians(12), math.radians(8)), mat=mat_gold, bevel_width=0.003)
    satchel_strap = make_flat_ribbon(
        "SatchelStrap",
        [(-0.16, -0.11, 1.28), (0.0, -0.13, 1.14), (0.17, -0.06, 0.98), (0.23, -0.02, 0.96)],
        [0.022, 0.022, 0.022, 0.022],
        thickness=0.004,
        mat=mat_dark_leather
    )
    chest_parts.extend([satchel_body, satchel_flap, satchel_buckle, satchel_strap])

    # =========================================================================
    # 3. FLOWING ADVENTURER CAPE WITH EMBOSSED ANGKOR WAT (Pivot: [0, 0.06, 1.44])
    # =========================================================================
    bm = bmesh.new()
    num_u = 16
    num_v = 20
    cape_grid = []

    for iv in range(num_v):
        v_frac = iv / (num_v - 1.0)
        cz = 1.42 - v_frac * 0.76
        width = 0.44 + v_frac * 0.16
        cy = 0.13 + v_frac * 0.07 + math.sin(v_frac * math.pi) * 0.02

        row = []
        for iu in range(num_u):
            u_frac = (iu / (num_u - 1.0)) * 2.0 - 1.0
            cx = u_frac * (width * 0.5)
            ripple = math.cos(u_frac * math.pi * 2.5) * (0.008 * v_frac)
            wrap_y = cy + (u_frac ** 2) * 0.030 + ripple
            vert = bm.verts.new(Vector((cx, wrap_y, cz)))
            row.append(vert)
        cape_grid.append(row)

    bm.verts.ensure_lookup_table()
    for iv in range(num_v - 1):
        for iu in range(num_u - 1):
            bm.faces.new([
                cape_grid[iv][iu],
                cape_grid[iv + 1][iu],
                cape_grid[iv + 1][iu + 1],
                cape_grid[iv][iu + 1]
            ])

    mesh_data = bpy.data.meshes.new("FlowingCape_MeshData")
    bm.to_mesh(mesh_data)
    bm.free()

    cape_obj = bpy.data.objects.new("HeroCapeMesh_Base", mesh_data)
    bpy.context.collection.objects.link(cape_obj)
    cape_obj.data.materials.append(mat_teal)

    solid_mod = cape_obj.modifiers.new("Solidify", type='SOLIDIFY')
    solid_mod.thickness = 0.010
    apply_all_modifiers(cape_obj)
    set_smooth(cape_obj)
    cape_parts.append(cape_obj)

    # -------------------------------------------------------------------------
    # PROMINENT GOLDEN ANGKOR WAT 5-TOWER EMBLEM
    # -------------------------------------------------------------------------
    ey_surf = 0.224
    ez_base = 1.02

    terraces_spec = [
        ("Terrace1", 0.40, 0.020, 0.010, ez_base),
        ("Terrace2", 0.34, 0.018, 0.010, ez_base + 0.016),
        ("Terrace3", 0.28, 0.016, 0.010, ez_base + 0.032),
    ]
    for tname, tw, th, td, tz in terraces_spec:
        tbox = make_beveled_box(f"Angkor_{tname}", (tw, td, th), (0.0, ey_surf, tz), mat=mat_gold, bevel_width=0.003)
        cape_parts.append(tbox)

    towers_spec = [
        ("TowerCenter", 0.00,  0.065, 0.140, 0.080),
        ("TowerMidL",  -0.090, 0.052, 0.105, 0.065),
        ("TowerMidR",   0.090, 0.052, 0.105, 0.065),
        ("TowerOuterL", -0.165, 0.042, 0.075, 0.050),
        ("TowerOuterR",  0.165, 0.042, 0.075, 0.050),
    ]
    for twname, tx, tw, th, sh in towers_spec:
        tz_body = ez_base + 0.042 + th * 0.5
        tbody = make_beveled_box(f"Angkor_{twname}_Body", (tw, 0.012, th), (tx, ey_surf, tz_body), mat=mat_gold, bevel_width=0.004)
        tz_spire_base = ez_base + 0.042 + th
        tspire = make_curved_tube(
            f"Angkor_{twname}_Spire",
            [(tx, ey_surf, tz_spire_base), (tx, ey_surf, tz_spire_base + sh * 0.65), (tx, ey_surf, tz_spire_base + sh)],
            [tw * 0.46, tw * 0.28, 0.005],
            mat=mat_gold_bright
        )
        tfinial = make_smooth_sphere(f"Angkor_{twname}_Finial", 0.008, (tx, ey_surf, tz_spire_base + sh + 0.007), mat=mat_gold_bright, segments=10, rings=6)
        cape_parts.extend([tbody, tspire, tfinial])

    hem_trim = make_beveled_box("CapeHemTrim", (0.56, 0.010, 0.018), (0.0, 0.228, 0.68), mat=mat_gold, bevel_width=0.003)
    cape_parts.append(hem_trim)

    # =========================================================================
    # 4. WAIST BELT & PUFFED RUSSET CHONG KBEN (Pivot: [0, 0, 0.88])
    # =========================================================================
    belt = make_subdivided_box("WaistBelt", (0.39, 0.27, 0.080), (0, 0.0, 0.90), mat=mat_dark_leather, subsurf=1)
    buckle = make_beveled_box("WaistBuckle", (0.085, 0.018, 0.085), (0, -0.138, 0.90), mat=mat_gold_bright, bevel_width=0.005)
    buckle_gem = make_smooth_sphere("WaistBuckleGem", 0.015, (0, -0.150, 0.90), scale=(1.0, 0.60, 1.0), mat=mat_sapphire, segments=12, rings=8)
    waist_parts.extend([belt, buckle, buckle_gem])

    # Unified Chong Kben Pelvis
    kben_pelvis = make_subdivided_box("KbenPelvis", (0.42, 0.29, 0.28), (0, 0.0, 0.77), mat=mat_kben, subsurf=2)
    waist_parts.append(kben_pelvis)

    # =========================================================================
    # 5 & 6. ARMS, SLEEVES, BRACERS & HANDS (Pivots: [±0.22, 0, 1.34])
    # =========================================================================
    for s, side, arm_list in [(-1, 'L', arm_l_parts), (1, 'R', arm_r_parts)]:
        ax = s * 0.22

        sleeve = make_curved_tube(
            f"UpperSleeve_{side}",
            [(ax, 0.0, 1.33), (ax + s * 0.03, 0.0, 1.22), (ax + s * 0.05, 0.0, 1.12)],
            [0.078, 0.075, 0.072],
            mat=mat_tunic
        )
        sleeve_cuff = make_curved_tube(
            f"SleeveCuff_{side}",
            [(ax + s * 0.05, 0.0, 1.13), (ax + s * 0.05, 0.0, 1.09)],
            [0.076, 0.076],
            mat=mat_gold
        )
        forearm = make_curved_tube(
            f"Forearm_{side}",
            [(ax + s * 0.05, 0.0, 1.10), (ax + s * 0.06, -0.01, 1.00), (ax + s * 0.06, -0.02, 0.90)],
            [0.058, 0.055, 0.052],
            mat=mat_skin
        )
        bracer = make_curved_tube(
            f"Bracer_{side}",
            [(ax + s * 0.06, -0.02, 0.94), (ax + s * 0.06, -0.02, 0.88)],
            [0.062, 0.062],
            mat=mat_gold
        )
        bracer_gem = make_smooth_sphere(f"BracerGem_{side}", 0.012, (ax + s * 0.122, -0.02, 0.91), mat=mat_sapphire, segments=10, rings=6)

        hx = ax + s * 0.06
        hy = -0.03
        hz = 0.84
        palm = make_smooth_sphere(f"Palm_{side}", 0.046, (hx, hy, hz), scale=(1.05, 0.65, 1.15), mat=mat_skin, segments=16, rings=10)
        thumb = make_curved_tube(
            f"Thumb_{side}",
            [(hx - s * 0.025, hy - 0.014, hz + 0.010), (hx - s * 0.040, hy - 0.026, hz - 0.015)],
            [0.015, 0.012],
            mat=mat_skin
        )
        finger_specs = [
            ("Index",  -s * 0.017, 0.050),
            ("Middle",  s * 0.000, 0.054),
            ("Ring",    s * 0.015, 0.048),
            ("Pinky",   s * 0.028, 0.040),
        ]
        fingers = []
        for fname, f_dx, f_len in finger_specs:
            fx = hx + f_dx
            fz_top = hz - 0.030
            fz_tip = fz_top - f_len
            fobj = make_curved_tube(
                f"Finger_{fname}_{side}",
                [(fx, hy - 0.005, fz_top), (fx, hy - 0.013, fz_top - f_len * 0.55), (fx, hy - 0.010, fz_tip)],
                [0.013, 0.012, 0.009],
                mat=mat_skin
            )
            fingers.append(fobj)

        arm_list.extend([sleeve, sleeve_cuff, forearm, bracer, bracer_gem, palm, thumb] + fingers)

    # =========================================================================
    # 7 & 8. LEGS, CHONG KBEN PUFFS, CALVES & BOOTS (Pivots: [±0.14, 0, 0.78])
    # =========================================================================
    for s, side, leg_list in [(-1, 'L', leg_l_parts), (1, 'R', leg_r_parts)]:
        lx = s * 0.13

        thigh_puff = make_smooth_sphere(f"LegKbenPuff_{side}", 0.110, (lx, 0.0, 0.67), scale=(1.05, 1.05, 1.15), mat=mat_kben, segments=22, rings=16)
        knee_cuff = make_curved_tube(f"KneeBand_{side}", [(lx, 0.0, 0.56), (lx, 0.0, 0.51)], [0.092, 0.092], mat=mat_gold)
        calf = make_smooth_cylinder(f"LegCalf_{side}", 0.062, 0.24, (lx, 0.0, 0.38), mat=mat_skin, vertices=16)

        boot_upper = make_curved_tube(f"BootUpper_{side}", [(lx, 0.0, 0.34), (lx, 0.0, 0.22), (lx, 0.0, 0.14)], [0.074, 0.070, 0.066], mat=mat_leather)
        ankle_cuff = make_curved_tube(f"AnkleCuff_{side}", [(lx, 0.0, 0.16), (lx, 0.0, 0.12)], [0.070, 0.070], mat=mat_gold)
        ankle_gem = make_smooth_sphere(f"AnkleGem_{side}", 0.013, (lx, -0.070, 0.140), mat=mat_sapphire, segments=10, rings=6)

        boot_foot = make_beveled_box(f"BootFoot_{side}", (0.105, 0.20, 0.068), (lx, -0.040, 0.046), mat=mat_leather, bevel_width=0.012)
        boot_sole = make_beveled_box(f"BootSole_{side}", (0.118, 0.22, 0.026), (lx, -0.040, 0.013), mat=mat_boot_sole, bevel_width=0.008)

        strap1 = make_curved_tube(
            f"BootStrap1_{side}",
            [(lx - 0.044, -0.022, 0.044), (lx, -0.042, 0.078), (lx + 0.044, -0.022, 0.044)],
            [0.010, 0.012, 0.010],
            mat=mat_gold
        )
        strap2 = make_curved_tube(
            f"BootStrap2_{side}",
            [(lx - 0.042, -0.084, 0.044), (lx, -0.104, 0.074), (lx + 0.042, -0.084, 0.044)],
            [0.010, 0.012, 0.010],
            mat=mat_gold
        )

        leg_list.extend([thigh_puff, knee_cuff, calf, boot_upper, ankle_cuff, ankle_gem, boot_foot, boot_sole, strap1, strap2])

    # =========================================================================
    # 9. ASSEMBLE 8 MODULAR HIERARCHIES MATCHING CHARACTER.TSX
    # =========================================================================
    parts = [
        ("HeroHeadMesh", head_parts, (0.0, 0.0, 1.62)),
        ("HeroChestMesh", chest_parts, (0.0, 0.0, 1.15)),
        ("HeroCapeMesh", cape_parts, (0.0, 0.06, 1.44)),
        ("HeroWaistMesh", waist_parts, (0.0, 0.0, 0.88)),
        ("HeroLeftArmMesh", arm_l_parts, (-0.22, 0.0, 1.34)),
        ("HeroRightArmMesh", arm_r_parts, (0.22, 0.0, 1.34)),
        ("HeroLeftLegMesh", leg_l_parts, (-0.14, 0.0, 0.78)),
        ("HeroRightLegMesh", leg_r_parts, (0.14, 0.0, 0.78)),
    ]

    total_tris = 0
    exported_objects = []
    for part_name, obj_list, pivot in parts:
        res = assemble_modular_part(part_name, obj_list, pivot)
        if res:
            empty, mesh = res
            exported_objects.extend([empty, mesh])
            total_tris += sum(len(p.vertices) - 2 for p in mesh.data.polygons)

    # =========================================================================
    # 10. EXPORT OPTIMIZED GLB
    # =========================================================================
    os.makedirs(os.path.dirname(OUTPUT_GLB), exist_ok=True)
    bpy.ops.object.select_all(action='DESELECT')
    for o in exported_objects:
        o.select_set(True)

    bpy.ops.export_scene.gltf(
        filepath=OUTPUT_GLB,
        use_selection=True,
        export_format='GLB',
        export_apply=False,
        export_yup=True
    )

    # =========================================================================
    # 11. STUDIO TURNAROUND CONTACT SHEET (8 HIGH-RES PREVIEWS)
    # =========================================================================
    for d in [ARTIFACT_DIR, SCRATCH_DIR]:
        os.makedirs(d, exist_ok=True)

    scene = bpy.context.scene
    scene.render.image_settings.file_format = 'PNG'
    scene.render.resolution_x = 1024
    scene.render.resolution_y = 1024
    scene.render.film_transparent = True

    def add_light(name, ltype, loc, rot, energy, color, size=1.0):
        ldata = bpy.data.lights.new(name=name, type=ltype)
        ldata.energy = energy
        ldata.color = color
        if ltype == 'AREA':
            ldata.size = size
        lobj = bpy.data.objects.new(name, ldata)
        lobj.location = Vector(loc)
        lobj.rotation_euler = Euler(rot, 'XYZ')
        bpy.context.collection.objects.link(lobj)
        return lobj

    add_light("StudioKey", 'AREA', (1.8, -2.5, 2.2), (math.radians(35), math.radians(15), math.radians(-30)), 150.0, (1.0, 0.98, 0.94), size=2.0)
    add_light("StudioFill", 'AREA', (-1.8, -2.2, 1.8), (math.radians(30), math.radians(-15), math.radians(35)), 90.0, (0.90, 0.95, 1.0), size=2.2)
    add_light("StudioBounce", 'POINT', (0.0, -1.6, 1.40), (0, 0, 0), 40.0, (1.0, 0.95, 0.90))
    add_light("StudioRim", 'SUN', (0.0, 3.2, 2.8), (math.radians(-50), 0, 0), 3.5, (1.0, 0.94, 0.78))

    cam_data = bpy.data.cameras.new("StudioCam")
    cam_data.lens = 52
    cam_obj = bpy.data.objects.new("StudioCam", cam_data)
    bpy.context.collection.objects.link(cam_obj)
    scene.camera = cam_obj

    def render_turnaround(angle_deg, filename):
        dist = 3.6
        rad = math.radians(angle_deg)
        cx = math.sin(rad) * dist
        cy = -math.cos(rad) * dist
        cz = 1.10
        cam_obj.location = Vector((cx, cy, cz))
        cam_obj.rotation_euler = Euler((math.radians(90), 0, rad), 'XYZ')

        for target_dir in [ARTIFACT_DIR, SCRATCH_DIR]:
            out_file = os.path.join(target_dir, filename)
            scene.render.filepath = out_file
            bpy.ops.render.render(write_still=True)
        print(f"Rendered: {filename}")

    # 1. Front View (0°)
    render_turnaround(0, "task65a_turnaround_front.png")
    # 2. 3/4 Front View (45°)
    render_turnaround(45, "task65a_turnaround_34_front.png")
    # 3. Right Profile View (90°)
    render_turnaround(90, "task65a_turnaround_profile_right.png")
    # 4. 3/4 Back View (135°)
    render_turnaround(135, "task65a_turnaround_34_back.png")
    # 5. Back View (180°)
    render_turnaround(180, "task65a_turnaround_back.png")
    # 6. Left Profile View (-90°)
    render_turnaround(-90, "task65a_turnaround_profile_left.png")

    # 7. In-Game Third-Person Camera View
    cam_data.lens = 45
    cam_obj.location = Vector((0.0, 3.3, 1.85))
    cam_obj.rotation_euler = Euler((math.radians(77), 0, math.radians(180)), 'XYZ')
    for target_dir in [ARTIFACT_DIR, SCRATCH_DIR]:
        scene.render.filepath = os.path.join(target_dir, "task65a_gameplay_rear_view.png")
        bpy.ops.render.render(write_still=True)
    print("Rendered: task65a_gameplay_rear_view.png")

    # 8. Hero Close-Up Portrait
    cam_data.lens = 65
    cam_obj.location = Vector((0.25, -1.8, 1.65))
    cam_obj.rotation_euler = Euler((math.radians(92), 0, math.radians(8)), 'XYZ')
    for target_dir in [ARTIFACT_DIR, SCRATCH_DIR]:
        scene.render.filepath = os.path.join(target_dir, "task65a_hero_portrait_closeup.png")
        bpy.ops.render.render(write_still=True)
    print("Rendered: task65a_hero_portrait_closeup.png")

    file_size_kb = os.path.getsize(OUTPUT_GLB) / 1024.0
    print(f"\nSUCCESS: Exported {OUTPUT_GLB} ({file_size_kb:.1f} KB, {len(parts)} modular parts, {total_tris} triangles)")


if __name__ == "__main__":
    build_character()

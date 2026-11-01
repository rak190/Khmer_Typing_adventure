"""
Khmer Typing Adventure - High-Fidelity Stylized 3D Hero Generator
Task 6.5A - Complete 3D Character Redesign and Quality Correction

Creates an authentic, lovable, and highly polished Cambodian student adventurer:
- Adorable chibi anime facial structure matching the reference sheet (3.5 heads tall).
- Large, expressive anime eyes with corneal gloss, deep amber/brown iris, pupils, and dual catchlights.
- Elegant anime lash rims and gentle arched eyebrows.
- Cute button nose and warm cheerful smile.
- Soft rosy cheek blush.
- Volumetric sculpted anime hair with swept bangs, side locks, crown spikes, and nape volume.
- Snug golden Khmer royal diadem with pearl filigree, vertical diamond crest, and glowing cyan sapphire gem.
- Streaming teal ribbon tails at the back of the diadem.
- Tailored cream adventurer tunic with folded V-collar and shoulder pauldrons.
- Draped teal scarf/cowl with soft organic folds around the neck.
- Flush crossed golden Royal Sangvar chest harness with central gemstone medallion.
- Leather adventurer satchel on right hip with cross-body strap and gold buckle.
- Single continuous flowing teal cloth cape with embossed golden Angkor Wat 5-tower silhouette.
- Puffed reddish-brown Chong Kben breeches (#883322) with golden filigree knee bands.
- Golden wrist cuffs (kang dai) and ankle cuffs (kang cheung).
- Touch-typing hands with 5 posed fingers ready for keyboard adventure.
- Sculpted rugged brown leather adventure boots with upturned toes and gold buckles.
- 8 modular pivot groups matching Character.tsx + 6 high-res studio turnaround contact renders.
"""

import bpy
import math
import os
from mathutils import Vector, Euler, Matrix

OUTPUT_GLB = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "public", "models", "characters", "khmer_student_hero.glb")
)
PREVIEW_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\97bfaea7-9ba3-4685-bc9a-4fa32b4fa799"
SCRATCH_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\97bfaea7-9ba3-4685-bc9a-4fa32b4fa799\scratch"


def to_b_pos(p):
    """Converts Three.js (x, y_up, z_fwd) to Blender (x, -z_fwd, y_up)."""
    return (p[0], -p[2], p[1])


def to_b_scale(s):
    """Converts Three.js scale (sx, sy_height, sz_depth) to Blender (sx, sz_depth, sy_height)."""
    return (s[0], s[2], s[1])


def to_b_rot(r):
    """Converts Three.js Euler rotations (rx, ry, rz) to Blender Euler rotations."""
    return (r[0], -r[2], r[1])


def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    for block in (bpy.data.meshes, bpy.data.materials, bpy.data.cameras, bpy.data.lights, bpy.data.images):
        for item in block:
            block.remove(item, do_unlink=True)


def create_pbr_material(name, base_color, metallic=0.0, roughness=0.5, sss_weight=0.0, sss_radius=(0.85, 0.48, 0.32), emission=None, emission_strength=1.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = base_color
        bsdf.inputs["Metallic"].default_value = metallic
        bsdf.inputs["Roughness"].default_value = roughness
        if "Subsurface Weight" in bsdf.inputs:
            bsdf.inputs["Subsurface Weight"].default_value = sss_weight
            if "Subsurface Radius" in bsdf.inputs:
                bsdf.inputs["Subsurface Radius"].default_value = sss_radius
        elif "Subsurface" in bsdf.inputs:
            bsdf.inputs["Subsurface"].default_value = sss_weight
        if emission:
            if "Emission Color" in bsdf.inputs:
                bsdf.inputs["Emission Color"].default_value = emission
            elif "Emission" in bsdf.inputs:
                bsdf.inputs["Emission"].default_value = emission
            if "Emission Strength" in bsdf.inputs:
                bsdf.inputs["Emission Strength"].default_value = emission_strength
    return mat


def set_smooth(obj):
    if obj.type == 'MESH':
        for poly in obj.data.polygons:
            poly.use_smooth = True


def create_beveled_box(name, dim, loc, rot=(0, 0, 0), mat=None, bevel_width=0.02):
    """Creates a cleanly beveled box that keeps its tailored garment shape."""
    b_loc = to_b_pos(loc)
    b_dim = to_b_scale(dim)
    b_rot = to_b_rot(rot)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=b_loc, rotation=b_rot)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = b_dim
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel_width > 0:
        mod = obj.modifiers.new("Bevel", type='BEVEL')
        mod.width = bevel_width
        mod.segments = 3
        bpy.ops.object.modifier_apply(modifier="Bevel")
    set_smooth(obj)
    if mat:
        obj.data.materials.append(mat)
    return obj


def create_smooth_sphere(name, radius, loc, scale=(1, 1, 1), rot=(0, 0, 0), mat=None, segments=24, rings=16):
    b_loc = to_b_pos(loc)
    b_scale = to_b_scale(scale)
    b_rot = to_b_rot(rot)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, radius=radius, location=b_loc, rotation=b_rot)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = b_scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    set_smooth(obj)
    if mat:
        obj.data.materials.append(mat)
    return obj


def create_smooth_cylinder(name, radius, depth, loc, rot=(0, 0, 0), scale=(1, 1, 1), mat=None, vertices=20):
    b_loc = to_b_pos(loc)
    b_rot = to_b_rot(rot)
    b_scale = to_b_scale(scale)
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=b_loc, rotation=b_rot)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = b_scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    set_smooth(obj)
    if mat:
        obj.data.materials.append(mat)
    return obj


def create_curved_tube(name, points_three, radii, mat=None, resolution=10):
    """Creates a smooth curved tubular mesh along 3D points in Three.js coordinates."""
    curve_data = bpy.data.curves.new(name=f"{name}_Curve", type='CURVE')
    curve_data.dimensions = '3D'
    curve_data.resolution_u = resolution
    curve_data.bevel_depth = radii[0]
    curve_data.bevel_resolution = 4
    curve_data.fill_mode = 'FULL'

    spline = curve_data.splines.new('BEZIER')
    spline.bezier_points.add(len(points_three) - 1)

    for i, pt in enumerate(points_three):
        b_pt = to_b_pos(pt)
        bp = spline.bezier_points[i]
        bp.co = Vector(b_pt)
        bp.handle_left_type = 'AUTO'
        bp.handle_right_type = 'AUTO'
        if i < len(radii) and radii[0] > 0:
            bp.radius = radii[i] / radii[0]
        else:
            bp.radius = 1.0

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


def create_tapered_hair_strand(name, p_root, p_mid, p_tip, r_root, r_mid, r_tip, mat=None):
    """Creates an organic tapered stylized anime hair clump with curved volume."""
    pts = [p_root, p_mid, p_tip]
    radii = [r_root, r_mid, r_tip]
    return create_curved_tube(name, pts, radii, mat=mat, resolution=8)


def create_flowing_cape(name, mat_teal, mat_gold):
    """Creates a draped, continuous cloth cape with natural shoulder folds and flaring hem."""
    bm_mesh = bpy.data.meshes.new(f"{name}_Mesh")
    rows = 11
    cols = 9
    verts = []
    faces = []

    # Width flaring from shoulders (w = 0.44) down to hem (w = 0.70)
    # Length from neckline (y = 1.40) down to calves (y = 0.46)
    for r in range(rows):
        v = r / (rows - 1.0)
        y = 1.40 - v * 0.94
        # Natural backward billow curve in Z
        z_curve = -0.13 - 0.14 * math.sin(v * math.pi * 0.82) - 0.03 * (v ** 1.5)
        half_w = 0.22 + v * 0.13

        for c in range(cols):
            u = (c / (cols - 1.0)) * 2.0 - 1.0
            x = u * half_w
            z_wrap = z_curve - 0.03 * (1.0 - u * u) * (1.0 - v * 0.5)
            ripple = 0.012 * math.sin(u * math.pi * 3.0) * (0.3 + 0.7 * v)
            verts.append(to_b_pos((x, y, z_wrap + ripple)))

    for r in range(rows - 1):
        for c in range(cols - 1):
            i0 = r * cols + c
            i1 = r * cols + (c + 1)
            i2 = (r + 1) * cols + (c + 1)
            i3 = (r + 1) * cols + c
            faces.append((i0, i1, i2, i3))

    bm_mesh.from_pydata(verts, [], faces)
    bm_mesh.update()
    cape_obj = bpy.data.objects.new(name, bm_mesh)
    bpy.context.collection.objects.link(cape_obj)
    bpy.context.view_layer.objects.active = cape_obj
    cape_obj.select_set(True)

    # Add Thickness
    mod_sol = cape_obj.modifiers.new("Solidify", type='SOLIDIFY')
    mod_sol.thickness = 0.016
    mod_sol.offset = 0.0
    bpy.ops.object.modifier_apply(modifier="Solidify")

    # Add Subdivision for cloth smoothness
    mod_sub = cape_obj.modifiers.new("Subsurf", type='SUBSURF')
    mod_sub.levels = 1
    bpy.ops.object.modifier_apply(modifier="Subsurf")

    set_smooth(cape_obj)
    cape_obj.data.materials.append(mat_teal)
    return cape_obj


def create_posed_hand(side_name, side_sign, hx, hy, hz, mat_skin, mat_gold):
    """Creates a cute chibi anime hand with palm, golden wrist cuff, and 5 touch-typing fingers."""
    hand_objs = []
    
    # Golden Wrist Cuff (Kang Dai)
    wrist_cuff = create_smooth_cylinder(
        f"WristCuff_{side_name}", 0.050, 0.026,
        (hx, hy + 0.04, hz - 0.01), rot=(math.radians(12), 0, 0), mat=mat_gold, vertices=16
    )
    hand_objs.append(wrist_cuff)

    # Stylized Palm
    palm = create_beveled_box(
        f"HandPalm_{side_name}", (0.065, 0.058, 0.034),
        (hx, hy, hz), rot=(math.radians(15), 0, 0), mat=mat_skin, bevel_width=0.012
    )
    hand_objs.append(palm)

    # Curved Touch-Typing Fingers (Index, Middle, Ring, Pinky, Thumb)
    finger_data = [
        ("Thumb",  side_sign * 0.028,  0.008, 0.020, 0.032, [0.012, 0.010]),
        ("Index",  side_sign * 0.015, -0.030, 0.008, 0.036, [0.011, 0.009]),
        ("Middle", side_sign * 0.000, -0.034, 0.004, 0.040, [0.011, 0.009]),
        ("Ring",  -side_sign * 0.014, -0.030, 0.002, 0.034, [0.010, 0.008]),
        ("Pinky", -side_sign * 0.024, -0.026, 0.000, 0.028, [0.009, 0.007]),
    ]
    for fname, ox, oy, oz, f_len, rads in finger_data:
        fx = hx + ox
        fy_root = hy + oy
        fz_root = hz + oz
        pts = [
            (fx, fy_root, fz_root),
            (fx + side_sign * 0.004, fy_root - f_len * 0.55, fz_root + 0.014),
            (fx + side_sign * 0.007, fy_root - f_len, fz_root + 0.022),
        ]
        f_obj = create_curved_tube(f"Finger_{fname}_{side_name}", pts, [rads[0], (rads[0]+rads[1])/2, rads[1]], mat=mat_skin, resolution=6)
        hand_objs.append(f_obj)

    return hand_objs


def assemble_modular_part(part_name, obj_list, pivot_three):
    """Joins meshes into a single unified mesh with its pivot centered at pivot_three."""
    if not obj_list:
        return None

    bpy.ops.object.select_all(action='DESELECT')
    for o in obj_list:
        o.select_set(True)
    bpy.context.view_layer.objects.active = obj_list[0]
    bpy.ops.object.join()

    joined_mesh = bpy.context.active_object
    joined_mesh.name = part_name

    # Set mesh origin to the specified Three.js pivot point
    b_piv = to_b_pos(pivot_three)
    bpy.context.scene.cursor.location = Vector(b_piv)
    bpy.ops.object.origin_set(type='ORIGIN_CURSOR')

    # Create empty parent node at pivot so GLTF hierarchy exports clean node transformations
    empty = bpy.data.objects.new(f"{part_name}_Root", None)
    empty.location = Vector(b_piv)
    bpy.context.collection.objects.link(empty)

    bpy.context.view_layer.update()
    joined_mesh.parent = empty
    joined_mesh.matrix_parent_inverse = empty.matrix_world.inverted()
    bpy.context.view_layer.update()

    return empty, joined_mesh


def build_hero():
    print("=== BUILDING POLISHED STYLIZED HERO FOR KHMER TYPING ADVENTURE ===")
    clear_scene()

    # =========================================================================
    # MATERIALS PALETTE (Authentic Cambodian Royal Adventure Palette)
    # =========================================================================
    # Warm golden Cambodian skin tone with soft subsurface scattering
    mat_skin = create_pbr_material("Mat_HeroSkin", (0.94, 0.74, 0.60, 1.0), roughness=0.45, sss_weight=0.35, sss_radius=(0.85, 0.48, 0.32))
    mat_blush = create_pbr_material("Mat_HeroBlush", (0.96, 0.54, 0.50, 1.0), roughness=0.55, sss_weight=0.40)
    mat_hair = create_pbr_material("Mat_HeroHair", (0.08, 0.05, 0.04, 1.0), roughness=0.35)
    
    # Ornate Royal Khmer Gold & Glowing Blue Sapphire
    mat_gold = create_pbr_material("Mat_HeroGold", (0.96, 0.76, 0.18, 1.0), metallic=0.92, roughness=0.25)
    mat_gold_bright = create_pbr_material("Mat_HeroGoldBright", (0.98, 0.85, 0.28, 1.0), metallic=0.94, roughness=0.20)
    mat_sapphire = create_pbr_material("Mat_HeroSapphire", (0.12, 0.78, 1.0, 1.0), roughness=0.08, emission=(0.10, 0.70, 1.0, 1.0), emission_strength=3.2)
    
    # Cream Adventurer Tunic (#F5E6CC)
    mat_cream_tunic = create_pbr_material("Mat_HeroCreamTunic", (0.95, 0.90, 0.82, 1.0), roughness=0.65)
    
    # Primary Rich Teal (Cape, Cowl, Front Sabai Apron #0D9488)
    mat_teal = create_pbr_material("Mat_HeroTeal", (0.05, 0.48, 0.49, 1.0), roughness=0.50)
    
    # Traditional Russet Chong Kben Breeches (#883322)
    mat_kben = create_pbr_material("Mat_HeroKben", (0.54, 0.20, 0.13, 1.0), roughness=0.60)
    
    # Warm Saddle Leather (Satchel, Straps, Belt)
    mat_leather = create_pbr_material("Mat_HeroLeather", (0.32, 0.18, 0.09, 1.0), roughness=0.48)
    # Rugged Dark Leather Boots
    mat_boots = create_pbr_material("Mat_HeroBoots", (0.22, 0.13, 0.07, 1.0), roughness=0.50)
    mat_sole = create_pbr_material("Mat_HeroSole", (0.12, 0.10, 0.09, 1.0), roughness=0.75)
    
    # Expressive Anime Eyes & Face
    mat_eye_sclera = create_pbr_material("Mat_EyeSclera", (0.98, 0.98, 0.98, 1.0), roughness=0.08)
    mat_eye_iris = create_pbr_material("Mat_EyeIris", (0.48, 0.25, 0.08, 1.0), roughness=0.15)
    mat_eye_pupil = create_pbr_material("Mat_EyePupil", (0.02, 0.015, 0.015, 1.0), roughness=0.05)
    mat_eye_catchlight = create_pbr_material("Mat_EyeCatchlight", (1.0, 1.0, 1.0, 1.0), roughness=0.05, emission=(1.0, 1.0, 1.0, 1.0), emission_strength=2.5)
    mat_eyelash = create_pbr_material("Mat_EyeLash", (0.12, 0.08, 0.06, 1.0), roughness=0.40)
    mat_smile = create_pbr_material("Mat_Smile", (0.65, 0.22, 0.20, 1.0), roughness=0.35)

    head_meshes = []
    chest_meshes = []
    cape_meshes = []
    waist_meshes = []
    arm_l_meshes = []
    arm_r_meshes = []
    leg_l_meshes = []
    leg_r_meshes = []

    # =========================================================================
    # 1. SCULPTED ANIME HEAD, CHIBI EYES, VOLUMETRIC HAIR & NECK (Pivot: X = 0, Y = 1.62, Z = 0)
    # Chibi proportions matching the 3.5 heads tall reference sheet
    # =========================================================================
    # Cute short neck connecting jaw smoothly down into the tunic cowl
    neck = create_curved_tube("HeroNeck", [(0, 1.60, 0.02), (0, 1.50, 0.01), (0, 1.38, 0.0)], [0.092, 0.088, 0.084], mat=mat_skin)
    head_meshes.append(neck)

    # Smooth sculpted cranium, jaw, and chin
    cranium = create_smooth_sphere("HeadCranium", 0.305, (0, 1.75, 0.0), scale=(1.0, 1.02, 0.96), mat=mat_skin, segments=32, rings=20)
    jaw = create_beveled_box("HeadJaw", (0.32, 0.24, 0.28), (0, 1.64, 0.05), mat=mat_skin, bevel_width=0.04)
    chin = create_beveled_box("HeadChin", (0.14, 0.10, 0.14), (0, 1.55, 0.09), mat=mat_skin, bevel_width=0.025)

    # Soft Rounded Cheeks with Rosy Apples
    cheek_l = create_smooth_sphere("CheekL", 0.115, (-0.15, 1.64, 0.13), scale=(1.0, 0.88, 0.88), mat=mat_skin, segments=18, rings=12)
    cheek_r = create_smooth_sphere("CheekR", 0.115, (0.15, 1.64, 0.13), scale=(1.0, 0.88, 0.88), mat=mat_skin, segments=18, rings=12)
    blush_l = create_smooth_sphere("BlushL", 0.042, (-0.165, 1.64, 0.235), scale=(1.25, 0.65, 0.20), mat=mat_blush, segments=14, rings=8)
    blush_r = create_smooth_sphere("BlushR", 0.042, (0.165, 1.64, 0.235), scale=(1.25, 0.65, 0.20), mat=mat_blush, segments=14, rings=8)

    # Adorable Button Nose
    nose_tip = create_beveled_box("NoseTip", (0.042, 0.036, 0.042), (0, 1.652, 0.288), mat=mat_skin, bevel_width=0.01)
    nose_bridge = create_curved_tube("NoseBridge", [(0, 1.715, 0.265), (0, 1.68, 0.280), (0, 1.652, 0.288)], [0.018, 0.021, 0.023], mat=mat_skin)

    # Friendly Smiling Mouth (Cheery curved lips with warm interior)
    smile_curve = create_curved_tube(
        "MouthSmile",
        [(-0.058, 1.588, 0.258), (-0.028, 1.570, 0.276), (0.0, 1.568, 0.278), (0.028, 1.570, 0.276), (0.058, 1.588, 0.258)],
        [0.007, 0.010, 0.011, 0.010, 0.007],
        mat=mat_smile
    )
    lower_lip = create_beveled_box("LowerLip", (0.040, 0.014, 0.016), (0, 1.554, 0.270), mat=mat_skin, bevel_width=0.005)

    # Large, Charming Anime Eyes (Chibi proportions matching reference sheet)
    for s, side in [(-1, 'L'), (1, 'R')]:
        ex = s * 0.114
        sclera = create_smooth_sphere(f"EyeSclera_{side}", 0.076, (ex, 1.712, 0.220), scale=(0.95, 1.15, 0.70), mat=mat_eye_sclera, segments=24, rings=16)
        iris = create_smooth_sphere(f"EyeIris_{side}", 0.052, (ex + s * 0.002, 1.714, 0.260), scale=(1.0, 1.12, 0.28), mat=mat_eye_iris, segments=20, rings=12)
        pupil = create_smooth_sphere(f"EyePupil_{side}", 0.030, (ex + s * 0.002, 1.714, 0.274), scale=(1.0, 1.12, 0.16), mat=mat_eye_pupil, segments=16, rings=10)
        sparkle1 = create_smooth_sphere(f"Catchlight1_{side}", 0.014, (ex + s * 0.002 - 0.011, 1.732, 0.284), mat=mat_eye_catchlight, segments=12, rings=8)
        sparkle2 = create_smooth_sphere(f"Catchlight2_{side}", 0.008, (ex + s * 0.002 + 0.009, 1.700, 0.284), mat=mat_eye_catchlight, segments=12, rings=8)

        # Bold Stylized Anime Upper Eyelash Rim with winged flick
        lash_pts = [
            (ex - s * 0.068, 1.766, 0.230),
            (ex, 1.784, 0.248),
            (ex + s * 0.062, 1.770, 0.236),
            (ex + s * 0.075, 1.780, 0.225),
        ]
        eyelash = create_curved_tube(f"Eyelash_{side}", lash_pts, [0.012, 0.018, 0.014, 0.008], mat=mat_eyelash)

        # Soft Arching Eyebrow
        eb_pts = [
            (ex - s * 0.060, 1.810, 0.240),
            (ex, 1.834, 0.256),
            (ex + s * 0.052, 1.812, 0.238),
        ]
        eyebrow = create_curved_tube(f"Eyebrow_{side}", eb_pts, [0.014, 0.022, 0.013], mat=mat_eyelash)

        # Stylized Ear
        ear = create_smooth_sphere(f"Ear_{side}", 0.074, (s * 0.30, 1.66, 0.02), scale=(0.35, 1.0, 0.78), mat=mat_skin, segments=18, rings=14)
        head_meshes.extend([sclera, iris, pupil, sparkle1, sparkle2, eyelash, eyebrow, ear])

    # Volumetric Hair Cap (Snugly positioned at the hairline)
    hair_cap = create_smooth_sphere("HairSkullCap", 0.325, (0, 1.82, -0.04), scale=(1.02, 1.02, 0.94), mat=mat_hair, segments=28, rings=18)
    head_meshes.append(hair_cap)

    # Volumetric Stylized Anime Hair Strands (Flowing, lush locks matching reference concept)
    hair_strands = [
        # Front Bangs framing forehead above royal diadem
        ("BangCenter",  (0.00, 2.00, 0.06), (0.00, 1.92, 0.22), (0.00, 1.84, 0.27), 0.072, 0.054, 0.020),
        ("BangInnerL", (-0.06, 1.98, 0.07), (-0.10, 1.90, 0.22), (-0.13, 1.83, 0.26), 0.068, 0.050, 0.018),
        ("BangInnerR",  (0.06, 1.98, 0.07),  (0.10, 1.90, 0.22),  (0.13, 1.83, 0.26), 0.068, 0.050, 0.018),
        ("BangMidL",   (-0.13, 1.94, 0.12), (-0.20, 1.86, 0.22), (-0.24, 1.78, 0.20), 0.064, 0.048, 0.018),
        ("BangMidR",    (0.13, 1.94, 0.12),  (0.20, 1.86, 0.22),  (0.24, 1.78, 0.20), 0.064, 0.048, 0.018),
        ("BangOuterL", (-0.20, 1.90, 0.10), (-0.27, 1.81, 0.16), (-0.30, 1.71, 0.13), 0.058, 0.044, 0.016),
        ("BangOuterR",  (0.20, 1.90, 0.10),  (0.27, 1.81, 0.16),  (0.30, 1.71, 0.13), 0.058, 0.044, 0.016),
        # Sideburn Tuft Locks
        ("SideTuftL",  (-0.28, 1.74, 0.07), (-0.30, 1.63, 0.06), (-0.28, 1.53, 0.03), 0.054, 0.040, 0.016),
        ("SideTuftR",   (0.28, 1.74, 0.07),  (0.30, 1.63, 0.06),  (0.28, 1.53, 0.03), 0.054, 0.040, 0.016),
        # Heroic Spiky Crown Crest Locks above diadem diamond
        ("TopSpikeC",   (0.00, 1.98, 0.08), (0.00, 2.11, 0.12), (0.00, 2.17, 0.05), 0.075, 0.060, 0.022),
        ("TopSpikeL",  (-0.09, 2.00, 0.04), (-0.14, 2.12, 0.06), (-0.17, 2.16, -0.02), 0.070, 0.056, 0.020),
        ("TopSpikeR",   (0.09, 2.00, 0.04),  (0.14, 2.12, 0.06),  (0.17, 2.16, -0.02), 0.070, 0.056, 0.020),
        # Crown Swept Back Spikes
        ("CrownC",      (0.00, 2.05, -0.04), (0.00, 2.13, -0.12), (0.00, 2.14, -0.20), 0.080, 0.065, 0.022),
        ("CrownL1",    (-0.12, 2.02, -0.04), (-0.18, 2.09, -0.12), (-0.21, 2.10, -0.20), 0.075, 0.060, 0.020),
        ("CrownR1",     (0.12, 2.02, -0.04),  (0.18, 2.09, -0.12),  (0.21, 2.10, -0.20), 0.075, 0.060, 0.020),
        ("CrownL2",    (-0.21, 1.96, -0.08), (-0.27, 2.01, -0.16), (-0.30, 2.01, -0.24), 0.070, 0.055, 0.018),
        ("CrownR2",     (0.21, 1.96, -0.08),  (0.27, 2.01, -0.16),  (0.30, 2.01, -0.24), 0.070, 0.055, 0.018),
        # Nape and Back Volume Locks (Full, luscious mane)
        ("NapeC",       (0.00, 1.83, -0.24), (0.00, 1.70, -0.30), (0.00, 1.58, -0.32), 0.082, 0.066, 0.024),
        ("NapeL",      (-0.14, 1.85, -0.23), (-0.18, 1.73, -0.29), (-0.20, 1.62, -0.31), 0.076, 0.060, 0.020),
        ("NapeR",       (0.14, 1.85, -0.23),  (0.18, 1.73, -0.29),  (0.20, 1.62, -0.31), 0.076, 0.060, 0.020),
        ("NapeUnderL", (-0.08, 1.78, -0.25), (-0.10, 1.65, -0.31), (-0.11, 1.52, -0.32), 0.068, 0.052, 0.018),
        ("NapeUnderR",  (0.08, 1.78, -0.25),  (0.10, 1.65, -0.31),  (0.11, 1.52, -0.32), 0.068, 0.052, 0.018),
    ]
    for hname, p0, p1, p2, wb, wm, wt in hair_strands:
        strand = create_tapered_hair_strand(f"Hair_{hname}", p0, p1, p2, wb, wm, wt, mat=mat_hair)
        head_meshes.append(strand)

    # Ornate Royal Khmer Diadem Band (Snug on forehead, beautifully curved)
    diadem_pts = []
    for a in range(25):
        ang = math.pi * 0.15 + (math.pi * 0.70) * (a / 24.0)
        diadem_pts.append((math.cos(ang) * 0.312, 1.80 + math.sin(ang) * 0.020, math.sin(ang) * 0.312))
    diadem_band = create_curved_tube("DiademBand", diadem_pts, [0.024] * len(diadem_pts), mat=mat_gold, resolution=12)
    head_meshes.append(diadem_band)

    # Beaded Gold Pearls along Diadem Rim
    for a in range(13):
        ang = math.pi * 0.20 + (math.pi * 0.60) * (a / 12.0)
        px = math.cos(ang) * 0.318
        py = 1.80 + math.sin(ang) * 0.020
        pz = math.sin(ang) * 0.318
        pearl = create_smooth_sphere(f"DiademPearl_{a}", 0.012, (px, py, pz), mat=mat_gold_bright, segments=10, rings=6)
        head_meshes.append(pearl)

    # Vertical Royal Khmer Diamond Crest (Signature emblem holding sapphire gem)
    crest_frame = create_beveled_box("DiademDiamondFrame", (0.072, 0.072, 0.022), (0.0, 1.83, 0.315), (0, 0, math.pi / 4), mat=mat_gold_bright, bevel_width=0.01)
    crest_gem = create_smooth_sphere("DiademSapphireGem", 0.028, (0.0, 1.83, 0.328), scale=(1.0, 1.0, 0.75), mat=mat_sapphire, segments=16, rings=12)
    crest_spire = create_curved_tube("DiademCrownSpire", [(0.0, 1.87, 0.308), (0.0, 1.93, 0.285)], [0.014, 0.005], mat=mat_gold_bright)
    head_meshes.extend([crest_frame, crest_gem, crest_spire])

    # Streaming Teal Ribbon Tails from back knot of diadem
    ribbon_l = create_curved_tube("DiademRibbonL", [(-0.06, 1.78, -0.30), (-0.11, 1.68, -0.32), (-0.13, 1.56, -0.33)], [0.022, 0.018, 0.012], mat=mat_teal)
    ribbon_r = create_curved_tube("DiademRibbonR", [(0.06, 1.78, -0.30), (0.11, 1.68, -0.32), (0.13, 1.56, -0.33)], [0.022, 0.018, 0.012], mat=mat_teal)
    head_meshes.extend([ribbon_l, ribbon_r])

    # =========================================================================
    # 2. CREAM TUNIC, DRAPED COWL & SANGVAR HARNESS (Pivot: X = 0, Y = 1.15, Z = 0)
    # Tailored adventurer tunic keeping solid garment proportions
    # =========================================================================
    tunic_torso = create_beveled_box("TunicTorso", (0.44, 0.46, 0.28), (0, 1.13, 0.0), mat=mat_cream_tunic, bevel_width=0.035)
    tunic_collar_l = create_curved_tube("TunicCollarL", [(-0.11, 1.36, 0.14), (-0.05, 1.28, 0.15), (0.0, 1.22, 0.155)], [0.018, 0.016, 0.012], mat=mat_gold)
    tunic_collar_r = create_curved_tube("TunicCollarR", [(0.11, 1.36, 0.14), (0.05, 1.28, 0.15), (0.0, 1.22, 0.155)], [0.018, 0.016, 0.012], mat=mat_gold)

    # Draped Teal Scarf/Cowl wrapping gracefully around neck base
    cowl_pts = []
    for a in range(17):
        ang = (math.pi * 2.0) * (a / 16.0)
        cowl_pts.append((math.cos(ang) * 0.22, 1.38 + 0.015 * math.sin(ang * 2.0), math.sin(ang) * 0.18))
    cowl_ring = create_curved_tube("TealCowlRing", cowl_pts, [0.046] * len(cowl_pts), mat=mat_teal, resolution=10)

    # Golden Shoulder Pauldrons (Positioned snugly at X = +/- 0.23, Y = 1.34)
    pauldron_l = create_smooth_sphere("PauldronL", 0.088, (-0.23, 1.34, 0.0), scale=(1.20, 0.85, 1.05), mat=mat_gold, segments=18, rings=12)
    pauldron_r = create_smooth_sphere("PauldronR", 0.088, (0.23, 1.34, 0.0), scale=(1.20, 0.85, 1.05), mat=mat_gold, segments=18, rings=12)
    pauldron_trim_l = create_curved_tube("PauldronTrimL", [(-0.29, 1.31, 0.07), (-0.23, 1.39, 0.08), (-0.17, 1.31, 0.07)], [0.014, 0.015, 0.014], mat=mat_gold_bright)
    pauldron_trim_r = create_curved_tube("PauldronTrimR", [(0.29, 1.31, 0.07), (0.23, 1.39, 0.08), (0.17, 1.31, 0.07)], [0.014, 0.015, 0.014], mat=mat_gold_bright)

    # Flush Crossed Royal Sangvar Harness (Directly on tunic front surface)
    sang_strap_l = create_curved_tube(
        "SangvarStrapL",
        [(-0.16, 1.32, 0.138), (-0.08, 1.23, 0.146), (0.0, 1.15, 0.148), (0.08, 1.07, 0.146), (0.16, 0.96, 0.138)],
        [0.016, 0.016, 0.016, 0.016, 0.016],
        mat=mat_gold
    )
    sang_strap_r = create_curved_tube(
        "SangvarStrapR",
        [(0.16, 1.32, 0.138), (0.08, 1.23, 0.146), (0.0, 1.15, 0.148), (-0.08, 1.07, 0.146), (-0.16, 0.96, 0.138)],
        [0.016, 0.016, 0.016, 0.016, 0.016],
        mat=mat_gold
    )
    sang_clasp = create_beveled_box("SangvarCenterMedallion", (0.050, 0.050, 0.018), (0.0, 1.15, 0.154), (0, 0, math.pi / 4), mat=mat_gold_bright, bevel_width=0.008)
    sang_gem = create_smooth_sphere("SangvarGem", 0.016, (0.0, 1.15, 0.165), mat=mat_sapphire, segments=12, rings=8)

    # Adventurer Satchel / Bag for Learning Items (Right hip)
    satchel_strap = create_curved_tube(
        "SatchelCrossStrap",
        [(-0.17, 1.33, 0.12), (0.0, 1.15, 0.146), (0.16, 0.98, 0.145), (0.22, 0.86, 0.10)],
        [0.015, 0.015, 0.015, 0.015],
        mat=mat_leather
    )
    satchel_body = create_beveled_box("SatchelBody", (0.085, 0.105, 0.070), (0.22, 0.84, 0.06), (0, math.radians(10), math.radians(-8)), mat=mat_leather, bevel_width=0.012)
    satchel_flap = create_beveled_box("SatchelFlap", (0.090, 0.060, 0.076), (0.22, 0.87, 0.065), (0, math.radians(10), math.radians(-8)), mat=mat_leather, bevel_width=0.010)
    satchel_buckle = create_beveled_box("SatchelBuckle", (0.026, 0.026, 0.014), (0.225, 0.84, 0.105), (0, 0, 0), mat=mat_gold_bright, bevel_width=0.004)

    chest_meshes.extend([
        tunic_torso, tunic_collar_l, tunic_collar_r, cowl_ring,
        pauldron_l, pauldron_r, pauldron_trim_l, pauldron_trim_r,
        sang_strap_l, sang_strap_r, sang_clasp, sang_gem,
        satchel_strap, satchel_body, satchel_flap, satchel_buckle
    ])

    # =========================================================================
    # 3. SINGLE CONTINUOUS FLOWING CAPE WITH ANGKOR WAT EMBLEM (Pivot: X = 0, Y = 1.44, Z = -0.12)
    # =========================================================================
    flowing_cape = create_flowing_cape("ContinuousCape", mat_teal, mat_gold)
    cape_meshes.append(flowing_cape)

    # Golden Angkor Wat 5-Tower Temple Silhouette embossed proudly on outer back
    # At Y ~ 1.15, outer cape surface is around Z = -0.27
    tower_c = create_beveled_box("AngkorTowerC", (0.054, 0.18, 0.016), (0.0, 1.16, -0.285), (math.radians(-7), 0, 0), mat=mat_gold, bevel_width=0.006)
    spire_c = create_curved_tube("AngkorSpireC", [(0.0, 1.25, -0.275), (0.0, 1.35, -0.262)], [0.022, 0.007], mat=mat_gold_bright)
    
    tower_l1 = create_beveled_box("AngkorTowerL1", (0.044, 0.145, 0.016), (-0.090, 1.11, -0.280), (math.radians(-7), 0, 0), mat=mat_gold, bevel_width=0.005)
    spire_l1 = create_curved_tube("AngkorSpireL1", [(-0.090, 1.18, -0.270), (-0.090, 1.25, -0.260)], [0.018, 0.006], mat=mat_gold_bright)
    tower_r1 = create_beveled_box("AngkorTowerR1", (0.044, 0.145, 0.016), (0.090, 1.11, -0.280), (math.radians(-7), 0, 0), mat=mat_gold, bevel_width=0.005)
    spire_r1 = create_curved_tube("AngkorSpireR1", [(0.090, 1.18, -0.270), (0.090, 1.25, -0.260)], [0.018, 0.006], mat=mat_gold_bright)

    tower_l2 = create_beveled_box("AngkorTowerL2", (0.036, 0.115, 0.016), (-0.168, 1.06, -0.274), (math.radians(-7), 0, 0), mat=mat_gold, bevel_width=0.004)
    spire_l2 = create_curved_tube("AngkorSpireL2", [(-0.168, 1.11, -0.266), (-0.168, 1.18, -0.258)], [0.015, 0.005], mat=mat_gold_bright)
    tower_r2 = create_beveled_box("AngkorTowerR2", (0.036, 0.115, 0.016), (0.168, 1.06, -0.274), (math.radians(-7), 0, 0), mat=mat_gold, bevel_width=0.004)
    spire_r2 = create_curved_tube("AngkorSpireR2", [(0.168, 1.11, -0.266), (0.168, 1.18, -0.258)], [0.015, 0.005], mat=mat_gold_bright)

    terrace_up = create_beveled_box("AngkorTerraceUp", (0.36, 0.024, 0.016), (0.0, 1.01, -0.292), (math.radians(-9), 0, 0), mat=mat_gold, bevel_width=0.004)
    terrace_mid = create_beveled_box("AngkorTerraceMid", (0.40, 0.024, 0.016), (0.0, 0.97, -0.298), (math.radians(-9), 0, 0), mat=mat_gold, bevel_width=0.004)
    terrace_base = create_beveled_box("AngkorTerraceBase", (0.44, 0.026, 0.016), (0.0, 0.93, -0.304), (math.radians(-9), 0, 0), mat=mat_gold_bright, bevel_width=0.004)

    cape_meshes.extend([
        tower_c, spire_c,
        tower_l1, spire_l1, tower_r1, spire_r1,
        tower_l2, spire_l2, tower_r2, spire_r2,
        terrace_up, terrace_mid, terrace_base
    ])

    # =========================================================================
    # 4. WAIST, BELT & RED-BROWN CHONG KBEN (Pivot: X = 0, Y = 0.88, Z = 0)
    # =========================================================================
    belt = create_smooth_cylinder("Belt", 0.205, 0.085, (0, 0.88, 0.01), scale=(1.05, 1.0, 0.95), mat=mat_leather, vertices=22)
    belt_trim_top = create_smooth_cylinder("BeltTrimTop", 0.210, 0.014, (0, 0.92, 0.01), scale=(1.05, 1.0, 0.95), mat=mat_gold, vertices=22)
    belt_trim_bot = create_smooth_cylinder("BeltTrimBot", 0.210, 0.014, (0, 0.84, 0.01), scale=(1.05, 1.0, 0.95), mat=mat_gold, vertices=22)
    buckle = create_smooth_cylinder("BeltBuckle", 0.060, 0.026, (0, 0.88, 0.205), rot=(math.pi / 2, 0, 0), mat=mat_gold_bright, vertices=18)
    buckle_gem = create_smooth_sphere("BuckleGem", 0.026, (0, 0.88, 0.220), mat=mat_sapphire, segments=14, rings=10)

    # Puffed Chong Kben Pelvis (Traditional Russet Breeches)
    kben_pelvis = create_beveled_box("KbenPelvis", (0.45, 0.30, 0.33), (0, 0.77, 0.0), mat=mat_kben, bevel_width=0.04)

    # Front Decorative Pleated Brocade Apron (Sabai flap hanging down center)
    apron = create_curved_tube(
        "FrontApron",
        [(0, 0.88, 0.205), (0, 0.74, 0.215), (0, 0.58, 0.200)],
        [0.050, 0.046, 0.038],
        mat=mat_teal
    )
    apron_pendant = create_beveled_box("ApronPendant", (0.042, 0.042, 0.022), (0, 0.60, 0.210), (0, 0, math.pi / 4), mat=mat_gold, bevel_width=0.008)

    waist_meshes.extend([belt, belt_trim_top, belt_trim_bot, buckle, buckle_gem, kben_pelvis, apron, apron_pendant])

    # =========================================================================
    # 5. ARMS, VAMBRACES & TOUCH-TYPING HANDS (Pivots: X = +/- 0.22, Y = 1.34)
    # Relaxed heroic adventurer pose with arms slightly angled forward
    # =========================================================================
    for s, side, arm_list in [(-1, 'L', arm_l_meshes), (1, 'R', arm_r_meshes)]:
        sx = s * 0.22
        # Upper Arm Sleeve matching cream tunic
        sleeve_pts = [(sx, 1.34, 0.0), (sx * 0.96, 1.23, 0.02), (sx * 0.93, 1.12, 0.04)]
        sleeve = create_curved_tube(f"UpperSleeve_{side}", sleeve_pts, [0.080, 0.078, 0.072], mat=mat_cream_tunic)
        sleeve_trim = create_curved_tube(f"SleeveTrim_{side}", [(sx * 0.94, 1.13, 0.04), (sx * 0.92, 1.11, 0.04)], [0.076, 0.076], mat=mat_gold)

        # Forearm with Golden Leather Vambrace (Kang Dai)
        forearm_pts = [(sx * 0.92, 1.11, 0.04), (sx * 0.90, 1.01, 0.07), (sx * 0.88, 0.91, 0.10)]
        forearm = create_curved_tube(f"ForearmSkin_{side}", forearm_pts, [0.066, 0.062, 0.058], mat=mat_skin)
        
        vam_pts = [(sx * 0.92, 1.10, 0.04), (sx * 0.90, 1.01, 0.07), (sx * 0.88, 0.92, 0.10)]
        vam = create_curved_tube(f"VambraceLeather_{side}", vam_pts, [0.072, 0.068, 0.066], mat=mat_leather)
        vam_top = create_curved_tube(f"VambraceTop_{side}", [(sx * 0.92, 1.10, 0.04), (sx * 0.91, 1.08, 0.04)], [0.076, 0.076], mat=mat_gold_bright)
        vam_bot = create_curved_tube(f"VambraceBot_{side}", [(sx * 0.89, 0.94, 0.09), (sx * 0.88, 0.92, 0.10)], [0.070, 0.070], mat=mat_gold_bright)

        # Touch-Typing Hand with Posed Fingers
        hx = sx * 0.86
        hy = 0.86
        hz = 0.13
        hand_objs = create_posed_hand(side, s, hx, hy, hz, mat_skin, mat_gold_bright)
        arm_list.extend([sleeve, sleeve_trim, forearm, vam, vam_top, vam_bot] + hand_objs)

    # =========================================================================
    # 6. LEGS, ANKLE CUFFS & SCULPTED ADVENTURE BOOTS (Pivots: X = +/- 0.14, Y = 0.78)
    # Continuous anatomy without gaps between pelvis and legs
    # =========================================================================
    for s, side, leg_list in [(-1, 'L', leg_l_meshes), (1, 'R', leg_r_meshes)]:
        lx = s * 0.14
        # Voluminous Puffed Chong Kben Thigh Breeches (Smooth organic bloomer puff)
        thigh_puff = create_smooth_sphere(f"LegKbenPuff_{side}", 0.165, (lx, 0.67, 0.0), scale=(1.05, 1.20, 1.05), mat=mat_kben, segments=20, rings=14)
        thigh_core = create_curved_tube(f"LegKbenCore_{side}", [(lx, 0.78, 0.0), (lx, 0.64, 0.0), (lx, 0.52, 0.0)], [0.150, 0.152, 0.118], mat=mat_kben)
        knee_cuff = create_curved_tube(f"KneeBand_{side}", [(lx, 0.52, 0.0), (lx, 0.49, 0.0)], [0.116, 0.116], mat=mat_gold)

        # Rugged Adventure Boots extending up to knee cuff
        boot_upper = create_curved_tube(f"BootUpper_{side}", [(lx, 0.49, 0.0), (lx, 0.32, 0.0), (lx, 0.16, 0.0)], [0.082, 0.076, 0.072], mat=mat_boots)

        # Golden Ankle Cuff / Kang Cheung with Beaded Detailing
        ankle_cuff = create_curved_tube(f"AnkleCuff_{side}", [(lx, 0.17, 0.0), (lx, 0.12, 0.0)], [0.076, 0.076], mat=mat_gold)
        ankle_gem = create_smooth_sphere(f"AnkleGem_{side}", 0.015, (lx, 0.145, 0.076), mat=mat_gold_bright, segments=10, rings=6)

        # Rugged Foot with Turned-up Toe and Sole Welts
        boot_foot = create_beveled_box(f"BootFoot_{side}", (0.112, 0.072, 0.22), (lx, 0.046, 0.040), mat=mat_boots, bevel_width=0.014)
        boot_sole = create_beveled_box(f"BootSole_{side}", (0.124, 0.026, 0.24), (lx, 0.013, 0.040), mat=mat_sole, bevel_width=0.008)
        
        strap1 = create_curved_tube(
            f"BootStrap1_{side}",
            [(lx - 0.052, 0.042, 0.022), (lx, 0.080, 0.040), (lx + 0.052, 0.042, 0.022)],
            [0.013, 0.014, 0.013],
            mat=mat_gold
        )
        strap2 = create_curved_tube(
            f"BootStrap2_{side}",
            [(lx - 0.050, 0.042, 0.092), (lx, 0.076, 0.112), (lx + 0.050, 0.042, 0.092)],
            [0.013, 0.014, 0.013],
            mat=mat_gold
        )

        leg_list.extend([thigh_puff, thigh_core, knee_cuff, boot_upper, ankle_cuff, ankle_gem, boot_foot, boot_sole, strap1, strap2])

    # =========================================================================
    # 7. ASSEMBLE 8 MODULAR HIERARCHIES MATCHING CHARACTER.TSX
    # =========================================================================
    parts = [
        ("HeroHeadMesh", head_meshes, (0.0, 1.62, 0.0)),
        ("HeroChestMesh", chest_meshes, (0.0, 1.15, 0.0)),
        ("HeroCapeMesh", cape_meshes, (0.0, 1.44, -0.12)),
        ("HeroWaistMesh", waist_meshes, (0.0, 0.88, 0.0)),
        ("HeroLeftArmMesh", arm_l_meshes, (-0.22, 1.34, 0.0)),
        ("HeroRightArmMesh", arm_r_meshes, (0.22, 1.34, 0.0)),
        ("HeroLeftLegMesh", leg_l_meshes, (-0.14, 0.78, 0.0)),
        ("HeroRightLegMesh", leg_r_meshes, (0.14, 0.78, 0.0)),
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
    # 8. EXPORT OPTIMIZED GLB
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
        export_materials='EXPORT',
    )

    # =========================================================================
    # 9. STUDIO TURNAROUND CONTACT SHEET (6 HIGH-RES PREVIEWS)
    # Soft portrait lighting with front bounce fill for radiant, clear rendering
    # =========================================================================
    for d in [PREVIEW_DIR, SCRATCH_DIR]:
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

    # Soft portrait lighting setup (flattering, no harsh shadows on face)
    add_light("KeyLight", 'AREA', (1.8, -2.6, 2.2), (math.radians(35), math.radians(15), math.radians(-30)), 120.0, (1.0, 0.96, 0.90), size=1.8)
    add_light("FillLight", 'AREA', (-1.8, -2.2, 1.8), (math.radians(30), math.radians(-15), math.radians(35)), 75.0, (0.85, 0.92, 1.0), size=2.2)
    add_light("FaceBounce", 'POINT', (0.0, -1.8, 1.70), (0, 0, 0), 30.0, (1.0, 0.96, 0.92))
    add_light("RimLight", 'SUN', (0.0, 3.2, 2.8), (math.radians(-50), 0, 0), 2.8, (1.0, 0.90, 0.70))

    cam_data = bpy.data.cameras.new("TurnaroundCam")
    cam_data.lens = 48
    cam_obj = bpy.data.objects.new("TurnaroundCam", cam_data)
    bpy.context.collection.objects.link(cam_obj)
    scene.camera = cam_obj

    # Helper to position camera at angle around character center (Z_blender = 1.10)
    def render_turnaround(angle_deg, filename):
        dist = 3.5
        rad = math.radians(angle_deg)
        cx = math.sin(rad) * dist
        cy = -math.cos(rad) * dist
        cz = 1.10
        cam_obj.location = Vector((cx, cy, cz))
        cam_obj.rotation_euler = Euler((math.radians(90), 0, rad), 'XYZ')
        
        # Save to both artifact directory and scratch
        for target_dir in [PREVIEW_DIR, SCRATCH_DIR]:
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

    # 7. Gameplay Third-Person View (180° elevation 1.85m looking down at cape & diadem)
    cam_data.lens = 45
    cam_obj.location = Vector((0.0, 3.2, 1.85))
    cam_obj.rotation_euler = Euler((math.radians(77), 0, math.radians(180)), 'XYZ')
    for target_dir in [PREVIEW_DIR, SCRATCH_DIR]:
        scene.render.filepath = os.path.join(target_dir, "task65a_gameplay_rear_view.png")
        bpy.ops.render.render(write_still=True)
    print("Rendered: task65a_gameplay_rear_view.png")

    # 8. Hero Close-up Portrait (15° front, bust portrait)
    cam_data.lens = 65
    cam_obj.location = Vector((0.45, -2.1, 1.68))
    cam_obj.rotation_euler = Euler((math.radians(92), 0, math.radians(12)), 'XYZ')
    for target_dir in [PREVIEW_DIR, SCRATCH_DIR]:
        scene.render.filepath = os.path.join(target_dir, "task65a_hero_portrait_closeup.png")
        bpy.ops.render.render(write_still=True)
    print("Rendered: task65a_hero_portrait_closeup.png")

    file_size_kb = os.path.getsize(OUTPUT_GLB) / 1024.0
    print(f"\nSUCCESS: Exported {OUTPUT_GLB} ({file_size_kb:.1f} KB, {len(parts)} modular parts, {total_tris} triangles)")


if __name__ == "__main__":
    build_hero()

"""
Khmer Typing Adventure - Stylized 3D Hero Character Generator
Task 6.5 - Character Reference Implementation and HUD Correction

Matches the target character art direction:
- Cambodian student adventurer with stylized chibi proportions (~1:3.8 head-to-body ratio).
- Warm glowing golden-tan skin (#E8A87C) with Subsurface Scattering and soft rosy blush cheeks.
- Expressive anime/Pixar-style warm honey-brown eyes with dual catchlights, sculpted lids, and brows.
- Smiling mouth with friendly upturned corners and stylized button nose.
- Voluminous swept-back spiky layered dark espresso hair with dynamic bangs framing the forehead.
- Golden diadem/headband with beaded trim, rising diamond crest and radiant cyan/blue sapphire gem.
- Primary rich Teal cape and cowl scarf draped over shoulders with golden trim.
- Iconic Golden Angkor Wat temple silhouette emblem embossed on the back of the teal cape!
- Cream/beige adventurer tunic and upper sleeves with gold accents.
- Crossed golden Royal Sangvar chest harness with central sapphire diamond medallion brooch.
- Golden pauldrons hugging shoulders.
- Brown leather adventure satchel for learning items slung diagonally across torso onto hip.
- Pleated Red-Brown / Russet Chong Kben breeches (#883322).
- Golden wrist cuffs (kang dai) and articulated 5-finger touch-typing home-row hands.
- Golden ankle cuffs (kang cheung) and leather adventurer boots with gold straps.
- 8 modular animated parts with exact joint pivots for Character.tsx procedural animation.
"""

import bpy
import math
import os
from mathutils import Vector, Euler, Matrix

OUTPUT_GLB = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "public", "models", "characters", "khmer_student_hero.glb")
)
OUTPUT_PREVIEW_FRONT = r"C:\Users\Admin\.gemini\antigravity\brain\97bfaea7-9ba3-4685-bc9a-4fa32b4fa799\scratch\task65_hero_front.png"
OUTPUT_PREVIEW_BACK = r"C:\Users\Admin\.gemini\antigravity\brain\97bfaea7-9ba3-4685-bc9a-4fa32b4fa799\scratch\task65_hero_back.png"
OUTPUT_PREVIEW_THREE_QUARTER = r"C:\Users\Admin\.gemini\antigravity\brain\97bfaea7-9ba3-4685-bc9a-4fa32b4fa799\scratch\task65_hero_34.png"


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


def add_subdivided_box(name, three_dim, three_loc, three_rot=(0, 0, 0), mat=None, subsurf_levels=2):
    b_loc = to_b_pos(three_loc)
    b_dim = to_b_scale(three_dim)
    b_rot = to_b_rot(three_rot)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=b_loc, rotation=b_rot)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = Vector(b_dim)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if subsurf_levels > 0:
        sub = obj.modifiers.new(name="Subsurf", type='SUBSURF')
        sub.levels = subsurf_levels
        sub.render_levels = subsurf_levels
        bpy.ops.object.modifier_apply(modifier="Subsurf")
    bpy.ops.object.shade_smooth()
    if mat:
        obj.data.materials.append(mat)
    return obj


def add_uv_sphere(name, radius, three_loc, three_rot=(0, 0, 0), three_scale=(1, 1, 1), mat=None, segments=24, rings=16):
    b_loc = to_b_pos(three_loc)
    b_scale = to_b_scale(three_scale)
    b_rot = to_b_rot(three_rot)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, radius=radius, location=b_loc, rotation=b_rot)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = Vector(b_scale)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    bpy.ops.object.shade_smooth()
    if mat:
        obj.data.materials.append(mat)
    return obj


def add_cylinder(name, radius, three_depth, three_loc, three_rot=(0, 0, 0), three_scale=(1, 1, 1), mat=None, vertices=20):
    b_loc = to_b_pos(three_loc)
    b_scale = to_b_scale(three_scale)
    b_rot = to_b_rot(three_rot)
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=three_depth, location=b_loc, rotation=b_rot)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = Vector(b_scale)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    bpy.ops.object.shade_smooth()
    if mat:
        obj.data.materials.append(mat)
    return obj


def create_curved_tube(name, three_points, radii, mat=None, resolution=12):
    mesh = bpy.data.meshes.new(name)
    verts = []
    faces = []
    prev_ring = None
    b_points = [to_b_pos(p) for p in three_points]

    for i, pt in enumerate(b_points):
        p = Vector(pt)
        r = radii[i] if i < len(radii) else radii[-1]
        if i < len(b_points) - 1:
            tangent = (Vector(b_points[i+1]) - p).normalized()
        else:
            tangent = (p - Vector(b_points[i-1])).normalized()
        up = Vector((0, 0, 1))
        if abs(tangent.dot(up)) > 0.92:
            up = Vector((0, 1, 0))
        normal = tangent.cross(up).normalized()
        binormal = tangent.cross(normal).normalized()
        ring_indices = []
        for a in range(resolution):
            theta = 2.0 * math.pi * a / resolution
            v = p + normal * (r * math.cos(theta)) + binormal * (r * math.sin(theta))
            ring_indices.append(len(verts))
            verts.append(v)
        if prev_ring is not None:
            for a in range(resolution):
                next_a = (a + 1) % resolution
                faces.append([prev_ring[a], prev_ring[next_a], ring_indices[next_a], ring_indices[a]])
        prev_ring = ring_indices

    # Cap start
    if len(b_points) > 0 and resolution >= 3:
        start_center = len(verts)
        verts.append(Vector(b_points[0]))
        for a in range(resolution):
            next_a = (a + 1) % resolution
            faces.append([start_center, a, next_a])
    # Cap end
    if len(b_points) > 1 and prev_ring:
        end_center = len(verts)
        verts.append(Vector(b_points[-1]))
        for a in range(resolution):
            next_a = (a + 1) % resolution
            faces.append([end_center, prev_ring[next_a], prev_ring[a]])

    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.shade_smooth()
    if mat:
        obj.data.materials.append(mat)
    return obj


def create_hair_lock(name, start, mid, end, base_radius, tip_radius, mat, resolution=10):
    return create_curved_tube(
        name,
        [start, mid, end],
        [base_radius, (base_radius + tip_radius) * 0.60, tip_radius],
        mat=mat,
        resolution=resolution
    )


def assemble_part(part_name, obj_list, three_pivot):
    valid_objs = [o for o in obj_list if o and o.name in bpy.data.objects]
    if not valid_objs:
        return None
    bpy.ops.object.select_all(action='DESELECT')
    for o in valid_objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = valid_objs[0]
    if len(valid_objs) > 1:
        bpy.ops.object.join()
    joined_mesh = bpy.context.active_object
    joined_mesh.name = part_name

    # Set origin to joint pivot in Blender coordinates
    b_pivot = to_b_pos(three_pivot)
    bpy.context.scene.cursor.location = Vector(b_pivot)
    bpy.ops.object.origin_set(type='ORIGIN_CURSOR')

    # Create empty container at pivot
    empty_name = part_name.replace("Mesh", "")
    empty = bpy.data.objects.new(empty_name, None)
    empty.empty_display_type = 'PLAIN_AXES'
    empty.empty_display_size = 0.15
    empty.location = Vector(b_pivot)
    bpy.context.collection.objects.link(empty)

    # Parent joined_mesh to empty with local origin at (0, 0, 0)
    joined_mesh.parent = empty
    joined_mesh.matrix_parent_inverse = Matrix.Identity(4)
    joined_mesh.location = Vector((0, 0, 0))
    joined_mesh.rotation_euler = Euler((0, 0, 0))
    joined_mesh.scale = Vector((1, 1, 1))

    return empty, joined_mesh


def create_unified_hand(side: str, s: float, sx: float, mat_skin, mat_gold):
    """
    Creates a stylized cartoon touch-typing hand:
    - Gold wrist bracelet (kang dai) seamlessly connecting forearm to palm.
    - Solid palm resting naturally above keyboard.
    - 5 curved fingers in touch-typing home-row arched posture.
    s: -1 for Left, +1 for Right.
    sx: shoulder X (-0.34 for Left, +0.34 for Right).
    """
    hand_parts = []
    # Wrist gold cuff (kang dai) connecting forearm to palm
    wrist_cuff = create_curved_tube(
        f"WristCuff_{side}",
        [(sx, 0.98, 0.0), (sx, 0.94, 0.01)],
        [0.068, 0.064],
        mat=mat_gold,
        resolution=12
    )
    hand_parts.append(wrist_cuff)

    # Palm body (extends smoothly from y=0.95 down to y=0.88, resting over keyboard)
    palm = add_subdivided_box(
        f"Palm_{side}",
        (0.092, 0.078, 0.040),
        (sx, 0.91, 0.02),
        (math.radians(12), 0, 0),
        mat=mat_skin,
        subsurf_levels=1
    )
    hand_parts.append(palm)

    # 5 Modeled Touch-Typing Fingers (Thumb + Index + Middle + Ring + Pinky)
    # Arched naturally over the home-row key positions
    configs = [
        # Thumb: angled inwards towards spacebar
        ("Thumb", sx - s * 0.042, 0.93, 0.028, 0.895, sx - s * 0.062, 0.865, 0.058, 0.018, 0.014),
        # Index: primary typing reach finger, curved downward over keycaps
        ("Index", sx - s * 0.027, 0.88, 0.024, 0.840, sx - s * 0.029, 0.795, 0.048, 0.017, 0.013),
        # Middle: longest finger, curved over home row keys
        ("Middle", sx - s * 0.009, 0.875, 0.024, 0.835, sx - s * 0.010, 0.785, 0.050, 0.018, 0.014),
        # Ring: natural relaxed touch curve
        ("Ring", sx + s * 0.010, 0.88, 0.024, 0.840, sx + s * 0.011, 0.798, 0.048, 0.017, 0.013),
        # Pinky: outer touch-typing finger
        ("Pinky", sx + s * 0.029, 0.89, 0.022, 0.850, sx + s * 0.031, 0.815, 0.042, 0.015, 0.011),
    ]

    for fname, x0, y0, z0, y_mid, x1, y1, z1, r0, r1 in configs:
        pts = [
            (x0, y0, z0),
            ((x0 + x1) * 0.5, y_mid, (z0 + z1) * 0.5 + 0.016),
            (x1, y1, z1),
        ]
        ftube = create_curved_tube(
            f"Finger_{fname}_{side}",
            pts,
            [r0, (r0 + r1) * 0.54, r1],
            mat=mat_skin,
            resolution=10,
        )
        hand_parts.append(ftube)

    return hand_parts


def build_stylized_hero():
    clear_scene()

    # =========================================================================
    # 0. PBR MATERIALS MATCHING ART DIRECTION
    # =========================================================================
    mat_skin = create_pbr_material("Mat_HeroSkin", (0.90, 0.66, 0.50, 1.0), roughness=0.42, sss_weight=0.28, sss_radius=(0.85, 0.48, 0.32))
    mat_blush = create_pbr_material("Mat_HeroBlush", (0.92, 0.46, 0.42, 1.0), roughness=0.6, sss_weight=0.35)
    mat_hair = create_pbr_material("Mat_HeroHair", (0.06, 0.04, 0.03, 1.0), roughness=0.30)
    mat_gold = create_pbr_material("Mat_HeroGold", (0.96, 0.77, 0.20, 1.0), metallic=1.0, roughness=0.20)
    mat_gold_bright = create_pbr_material("Mat_HeroGoldBright", (0.98, 0.85, 0.28, 1.0), metallic=1.0, roughness=0.16)
    mat_sapphire = create_pbr_material("Mat_HeroSapphire", (0.08, 0.70, 1.0, 1.0), roughness=0.08, emission=(0.05, 0.55, 1.0, 1.0), emission_strength=2.5)
    
    # In target art direction: Tunic is Cream/Beige cloth under cape
    mat_beige_tunic = create_pbr_material("Mat_HeroBeigeTunic", (0.93, 0.89, 0.82, 1.0), roughness=0.65)
    
    # Primary Teal: Cape & Cowl
    mat_teal_cowl = create_pbr_material("Mat_HeroTealCowl", (0.05, 0.48, 0.48, 1.0), roughness=0.55)
    mat_cape = create_pbr_material("Mat_HeroCape", (0.05, 0.48, 0.48, 1.0), roughness=0.50)
    
    # Red-Brown / Russet Chong Kben Breeches (#883322)
    mat_kben = create_pbr_material("Mat_HeroKben", (0.53, 0.20, 0.13, 1.0), roughness=0.62)
    
    # Brown Leather: Boots and Adventure Satchel
    mat_leather = create_pbr_material("Mat_HeroLeather", (0.28, 0.16, 0.08, 1.0), roughness=0.48)
    mat_boots = create_pbr_material("Mat_HeroBoots", (0.22, 0.13, 0.07, 1.0), roughness=0.52)
    
    # Eyes & Expressions
    mat_eye_white = create_pbr_material("Mat_EyeWhite", (0.98, 0.98, 0.97, 1.0), roughness=0.10)
    mat_eye_iris = create_pbr_material("Mat_EyeIris", (0.46, 0.26, 0.10, 1.0), roughness=0.18)
    mat_eye_pupil = create_pbr_material("Mat_EyePupil", (0.03, 0.03, 0.03, 1.0), roughness=0.08)
    mat_eye_sparkle = create_pbr_material("Mat_EyeSparkle", (1.0, 1.0, 1.0, 1.0), roughness=0.05, emission=(1.0, 1.0, 1.0, 1.0), emission_strength=1.8)
    mat_mouth = create_pbr_material("Mat_Mouth", (0.64, 0.22, 0.20, 1.0), roughness=0.35)

    head_meshes = []
    chest_meshes = []
    cape_meshes = []
    waist_meshes = []
    arm_l_meshes = []
    arm_r_meshes = []
    leg_l_meshes = []
    leg_r_meshes = []

    # =========================================================================
    # 1. HEAD, FACE, CROWN & VOLUMINOUS HAIR (Pivot: X = 0, Y = 1.72, Z = 0)
    # =========================================================================
    head_base = add_uv_sphere("HeadBase", 0.32, (0, 1.84, 0.0), three_scale=(0.98, 1.02, 0.98), mat=mat_skin, segments=28, rings=20)
    jaw = add_uv_sphere("JawChubby", 0.26, (0, 1.73, 0.06), three_scale=(1.04, 0.86, 0.94), mat=mat_skin)
    chin = add_uv_sphere("ChinSoft", 0.12, (0, 1.63, 0.12), three_scale=(0.9, 0.8, 0.8), mat=mat_skin)

    # Stylized Button Nose
    nose_bridge = create_curved_tube("NoseBridge", [(0, 1.83, 0.29), (0, 1.78, 0.33), (0, 1.75, 0.338)], [0.024, 0.027, 0.030], mat=mat_skin)
    nose_tip = add_uv_sphere("NoseTip", 0.034, (0, 1.75, 0.338), three_scale=(1.1, 0.9, 1.0), mat=mat_skin)

    # Friendly Smiling Mouth
    mouth_curve = create_curved_tube(
        "MouthSmile",
        [(-0.065, 1.685, 0.285), (-0.032, 1.666, 0.312), (0.0, 1.664, 0.314), (0.032, 1.666, 0.312), (0.065, 1.685, 0.285)],
        [0.008, 0.011, 0.012, 0.011, 0.008],
        mat=mat_mouth
    )
    lower_lip = add_subdivided_box("LowerLip", (0.052, 0.018, 0.022), (0, 1.648, 0.302), mat=mat_skin, subsurf_levels=1)

    # Rosy Cheeks
    cheek_l = add_uv_sphere("CheekL", 0.065, (-0.165, 1.73, 0.230), three_scale=(1.0, 0.7, 0.4), mat=mat_blush)
    cheek_r = add_uv_sphere("CheekR", 0.065, (0.165, 1.73, 0.230), three_scale=(1.0, 0.7, 0.4), mat=mat_blush)

    # Large Anime/Pixar Expressive Eyes
    for s, side in [(-1, 'L'), (1, 'R')]:
        ex = s * 0.125
        eye_white = add_uv_sphere(f"EyeWhite_{side}", 0.082, (ex, 1.815, 0.240), three_scale=(0.95, 1.15, 0.85), mat=mat_eye_white)
        iris = add_uv_sphere(f"EyeIris_{side}", 0.056, (ex + s * 0.004, 1.820, 0.295), three_scale=(1.0, 1.1, 0.35), mat=mat_eye_iris)
        pupil = add_uv_sphere(f"EyePupil_{side}", 0.034, (ex + s * 0.004, 1.820, 0.310), three_scale=(1.0, 1.1, 0.20), mat=mat_eye_pupil)
        sparkle1 = add_uv_sphere(f"Sparkle1_{side}", 0.016, (ex + s * 0.004 - 0.014, 1.842, 0.322), mat=mat_eye_sparkle)
        sparkle2 = add_uv_sphere(f"Sparkle2_{side}", 0.009, (ex + s * 0.004 + 0.012, 1.805, 0.322), mat=mat_eye_sparkle)
        # Upper lash line
        lash_pts = [
            (ex - s * 0.070, 1.875, 0.255),
            (ex, 1.890, 0.275),
            (ex + s * 0.065, 1.875, 0.260)
        ]
        lash = create_curved_tube(f"Eyelash_{side}", lash_pts, [0.010, 0.015, 0.010], mat=mat_hair)
        # Eyebrows
        eb_pts = [
            (ex - s * 0.065, 1.912, 0.265),
            (ex, 1.935, 0.280),
            (ex + s * 0.058, 1.910, 0.260)
        ]
        eyebrow = create_curved_tube(f"Eyebrow_{side}", eb_pts, [0.018, 0.026, 0.016], mat=mat_hair)
        # Ears
        ear_lobe = add_uv_sphere(f"Ear_{side}", 0.082, (s * 0.315, 1.76, 0.02), three_scale=(0.4, 1.0, 0.8), mat=mat_skin)
        head_meshes.extend([eye_white, iris, pupil, sparkle1, sparkle2, lash, eyebrow, ear_lobe])

    # Voluminous Hair Mass + Dynamic Swept Anime Locks
    hair_cap = add_uv_sphere("HairCap", 0.35, (0, 1.90, -0.05), three_scale=(1.04, 1.06, 1.08), mat=mat_hair)
    head_meshes.append(hair_cap)

    # Dynamic Swept-Back Thick Locks matching Reference Sheet
    # Bangs parted to frame the forehead and prominently reveal the golden crest
    hair_locks = [
        # Side bangs framing crown and headband without obscuring center crest
        ("BangLeft1", (-0.05, 2.06, 0.15), (-0.12, 1.96, 0.31), (-0.18, 1.88, 0.29), 0.075, 0.022),
        ("BangLeft2", (-0.15, 2.03, 0.13), (-0.24, 1.92, 0.27), (-0.30, 1.84, 0.24), 0.070, 0.020),
        ("BangRight1", (0.05, 2.06, 0.15), (0.12, 1.96, 0.31), (0.18, 1.88, 0.29), 0.075, 0.022),
        ("BangRight2", (0.15, 2.03, 0.13), (0.24, 1.92, 0.27), (0.30, 1.84, 0.24), 0.070, 0.020),
        # Sideburns
        ("SideburnL", (-0.28, 1.88, 0.14), (-0.30, 1.76, 0.12), (-0.29, 1.64, 0.08), 0.055, 0.018),
        ("SideburnR", (0.28, 1.88, 0.14), (0.30, 1.76, 0.12), (0.29, 1.64, 0.08), 0.055, 0.018),
        # High Swept Crown & Back Spikes (dynamic anime adventurer silhouette)
        ("TopSpikeC", (0.00, 2.14, 0.02), (0.00, 2.26, -0.06), (0.02, 2.32, -0.14), 0.090, 0.025),
        ("TopSpikeL1", (-0.12, 2.11, 0.04), (-0.20, 2.23, -0.04), (-0.25, 2.29, -0.12), 0.085, 0.022),
        ("TopSpikeR1", (0.12, 2.11, 0.04), (0.18, 2.23, -0.04), (0.25, 2.29, -0.12), 0.085, 0.022),
        ("TopSpikeL2", (-0.23, 2.06, -0.02), (-0.32, 2.14, -0.12), (-0.38, 2.18, -0.22), 0.080, 0.020),
        ("TopSpikeR2", (0.23, 2.06, -0.02), (0.32, 2.14, -0.12), (0.38, 2.18, -0.22), 0.080, 0.020),
        ("BackLockL", (-0.16, 1.90, -0.28), (-0.22, 1.80, -0.38), (-0.26, 1.70, -0.42), 0.082, 0.022),
        ("BackLockR", (0.16, 1.90, -0.28), (0.22, 1.80, -0.38), (0.26, 1.70, -0.42), 0.082, 0.022),
        ("BackLockC", (0.00, 1.87, -0.30), (0.00, 1.74, -0.40), (0.00, 1.64, -0.44), 0.088, 0.024),
    ]
    for hname, p0, p1, p2, r0, r1 in hair_locks:
        hlock = create_hair_lock(f"Hair_{hname}", p0, p1, p2, r0, r1, mat_hair)
        head_meshes.append(hlock)

    # Cambodian Golden Headband / Diadem with Beaded Border:
    crown_band_pts = []
    for a in range(21):
        ang = math.pi * 0.16 + (math.pi * 0.68) * (a / 20.0)
        crown_band_pts.append((math.cos(ang) * 0.332, 1.90 + math.sin(ang) * 0.025, math.sin(ang) * 0.332))
    crown_band = create_curved_tube("CrownCirclet", crown_band_pts, [0.034] * len(crown_band_pts), mat=mat_gold, resolution=12)

    # Scalloped / beaded decorative gold dots along the headband
    for a in range(11):
        ang = math.pi * 0.22 + (math.pi * 0.56) * (a / 10.0)
        bx = math.cos(ang) * 0.336
        by = 1.90 + math.sin(ang) * 0.025
        bz = math.sin(ang) * 0.336
        dot = add_uv_sphere(f"CrownDot_{a}", 0.016, (bx, by, bz), mat=mat_gold_bright)
        head_meshes.append(dot)

    # Prominent vertical rising diamond crest with radiant blue sapphire
    crest_base = add_subdivided_box("CrownCrestBase", (0.14, 0.14, 0.045), (0, 1.96, 0.335), (0, 0, math.pi / 4), mat=mat_gold, subsurf_levels=1)
    crest_inner = add_subdivided_box("CrownCrestInner", (0.10, 0.10, 0.050), (0, 1.96, 0.350), (0, 0, math.pi / 4), mat=mat_gold_bright, subsurf_levels=1)
    crest_gem = add_subdivided_box("CrownSapphire", (0.065, 0.065, 0.038), (0, 1.96, 0.368), (0, 0, math.pi / 4), mat=mat_sapphire, subsurf_levels=1)

    ribbon_knot = add_uv_sphere("RibbonKnot", 0.045, (0, 1.84, -0.32), mat=mat_teal_cowl)
    ribbon_tail1 = create_curved_tube("RibbonTailL", [(0, 1.84, -0.32), (-0.09, 1.76, -0.36), (-0.14, 1.64, -0.38)], [0.032, 0.026, 0.016], mat=mat_teal_cowl)
    ribbon_tail2 = create_curved_tube("RibbonTailR", [(0, 1.84, -0.32), (0.09, 1.76, -0.36), (0.14, 1.64, -0.38)], [0.032, 0.026, 0.016], mat=mat_teal_cowl)

    head_meshes.extend([
        head_base, jaw, chin, nose_bridge, nose_tip, mouth_curve, lower_lip,
        cheek_l, cheek_r, crown_band, crest_base, crest_inner, crest_gem,
        ribbon_knot, ribbon_tail1, ribbon_tail2
    ])

    # =========================================================================
    # 2. CHEST, COWL, PAULDRONS & SANGVAR HARNESS (Pivot: X = 0, Y = 1.15, Z = 0)
    # =========================================================================
    neck = add_cylinder("HeroNeck", 0.11, 0.18, (0, 1.63, 0.0), mat=mat_skin)

    # Stylized Teal Cowl Collar (draped teal scarf wrapping shoulders and neck)
    cowl_ring = create_curved_tube(
        "CowlCollar",
        [
            (-0.20, 1.52, 0.10), (0, 1.49, 0.17), (0.20, 1.52, 0.10),
            (0.20, 1.54, -0.06), (0, 1.55, -0.14), (-0.20, 1.54, -0.06), (-0.20, 1.52, 0.10)
        ],
        [0.070] * 7,
        mat=mat_teal_cowl,
        resolution=14
    )

    # Solid, Seamless Cream/Beige Tunic Torso (connects cleanly from neck down to belt)
    tunic_torso = add_subdivided_box(
        "TunicTorso",
        (0.46, 0.58, 0.30),
        (0, 1.16, 0.0),
        mat=mat_beige_tunic,
        subsurf_levels=1
    )

    # Crossed Royal Sangvar Harness (flush against tunic chest)
    sang_strap_l = create_curved_tube(
        "SangvarStrapL",
        [(-0.16, 1.44, 0.12), (-0.08, 1.30, 0.155), (0.00, 1.18, 0.162), (0.09, 1.04, 0.155), (0.16, 0.90, 0.13)],
        [0.026, 0.028, 0.030, 0.028, 0.026],
        mat=mat_gold
    )
    sang_strap_r = create_curved_tube(
        "SangvarStrapR",
        [(0.16, 1.44, 0.12), (0.08, 1.30, 0.155), (0.00, 1.18, 0.162), (-0.09, 1.04, 0.155), (-0.16, 0.90, 0.13)],
        [0.026, 0.028, 0.030, 0.028, 0.026],
        mat=mat_gold
    )
    # Central Sangvar Clasp: large golden diamond brooch with radiant blue sapphire
    sang_clasp = add_subdivided_box("SangvarClasp", (0.11, 0.11, 0.036), (0, 1.18, 0.174), (0, 0, math.pi / 4), mat=mat_gold_bright, subsurf_levels=1)
    sang_gem = add_subdivided_box("SangvarGem", (0.065, 0.065, 0.030), (0, 1.18, 0.192), (0, 0, math.pi / 4), mat=mat_sapphire, subsurf_levels=1)

    # Symmetrical Layered Golden Pauldrons (Shoulder Armor)
    for s, side in [(-1, 'L'), (1, 'R')]:
        px = s * 0.28
        p_dome = add_uv_sphere(f"PauldronDome_{side}", 0.135, (px, 1.40, 0.0), three_scale=(1.12, 0.85, 1.10), mat=mat_gold)
        p_rim = create_curved_tube(
            f"PauldronRim_{side}",
            [(px - s * 0.10, 1.33, 0.08), (px, 1.31, 0.10), (px + s * 0.10, 1.33, -0.08)],
            [0.024, 0.026, 0.024],
            mat=mat_gold_bright
        )
        chest_meshes.extend([p_dome, p_rim])

    # Adventurer Leather Satchel for learning items (slung on left hip with strap across torso)
    satchel_strap = create_curved_tube(
        "SatchelStrap",
        [(0.16, 1.44, 0.08), (0.02, 1.25, 0.16), (-0.16, 1.04, 0.14), (-0.23, 0.88, 0.10)],
        [0.022, 0.022, 0.022, 0.020],
        mat=mat_leather
    )
    # Leather pouch body on left hip
    satchel_body = add_subdivided_box(
        "SatchelBody",
        (0.12, 0.14, 0.09),
        (-0.24, 0.88, 0.06),
        (math.radians(8), math.radians(-10), 0),
        mat=mat_leather,
        subsurf_levels=1
    )
    # Curved satchel top flap with golden diamond clasp
    satchel_flap = add_subdivided_box(
        "SatchelFlap",
        (0.125, 0.08, 0.095),
        (-0.24, 0.93, 0.07),
        (math.radians(12), math.radians(-10), 0),
        mat=mat_leather,
        subsurf_levels=1
    )
    satchel_clasp = add_subdivided_box(
        "SatchelClasp",
        (0.030, 0.030, 0.018),
        (-0.24, 0.88, 0.12),
        (0, 0, math.pi / 4),
        mat=mat_gold_bright,
        subsurf_levels=1
    )

    chest_meshes.extend([
        neck, cowl_ring, tunic_torso,
        sang_strap_l, sang_strap_r, sang_clasp, sang_gem,
        satchel_strap, satchel_body, satchel_flap, satchel_clasp
    ])

    # =========================================================================
    # 3. CAPELET WITH GOLD ANGKOR WAT TEMPLE SILHOUETTE (Pivot: X = 0, Y = 1.44, Z = -0.12)
    # =========================================================================
    # Wide, flowing cape draping down to knee height (Y = 0.55), matches reference back view
    cape_top = add_subdivided_box("CapeTop", (0.46, 0.10, 0.04), (0, 1.44, -0.13), mat=mat_cape, subsurf_levels=1)
    cape_upper = add_subdivided_box("CapeUpper", (0.54, 0.40, 0.035), (0, 1.20, -0.16), (math.radians(-6), 0, 0), mat=mat_cape, subsurf_levels=1)
    cape_mid = add_subdivided_box("CapeMid", (0.60, 0.38, 0.035), (0, 0.88, -0.20), (math.radians(-10), 0, 0), mat=mat_cape, subsurf_levels=1)
    cape_lower = add_subdivided_box("CapeLower", (0.62, 0.35, 0.03), (0, 0.62, -0.24), (math.radians(-14), 0, 0), mat=mat_cape, subsurf_levels=1)
    cape_trim = create_curved_tube("CapeTrim", [(-0.29, 0.46, -0.27), (0, 0.44, -0.27), (0.29, 0.46, -0.27)], [0.016, 0.018, 0.016], mat=mat_gold)

    # --- GOLD ANGKOR WAT EMBLEM ON BACK OF CAPE ---
    # Signature Khmer cultural element prominently displayed in the reference image:
    # 5 towers (Prasat) rising above stepped galleries:
    # 1) Central Grand Tower with lotus pinnacle (X = 0)
    tower_c_body = add_subdivided_box("AngkorTowerC", (0.065, 0.20, 0.015), (0.0, 1.16, -0.185), (math.radians(-6), 0, 0), mat=mat_gold, subsurf_levels=1)
    tower_c_spire = create_curved_tube("AngkorSpireC", [(0.0, 1.26, -0.173), (0.0, 1.35, -0.163)], [0.028, 0.009], mat=mat_gold_bright)
    
    # 2) Intermediate Left & Right Towers (X = +/- 0.10)
    tower_l1 = add_subdivided_box("AngkorTowerL1", (0.050, 0.15, 0.014), (-0.10, 1.11, -0.179), (math.radians(-6), 0, 0), mat=mat_gold, subsurf_levels=1)
    tower_l1_spire = create_curved_tube("AngkorSpireL1", [(-0.10, 1.18, -0.170), (-0.10, 1.25, -0.163)], [0.023, 0.008], mat=mat_gold_bright)
    tower_r1 = add_subdivided_box("AngkorTowerR1", (0.050, 0.15, 0.014), (0.10, 1.11, -0.179), (math.radians(-6), 0, 0), mat=mat_gold, subsurf_levels=1)
    tower_r1_spire = create_curved_tube("AngkorSpireR1", [(0.10, 1.18, -0.170), (0.10, 1.25, -0.163)], [0.023, 0.008], mat=mat_gold_bright)

    # 3) Outer Left & Right Towers (X = +/- 0.18)
    tower_l2 = add_subdivided_box("AngkorTowerL2", (0.040, 0.12, 0.014), (-0.18, 1.06, -0.174), (math.radians(-6), 0, 0), mat=mat_gold, subsurf_levels=1)
    tower_l2_spire = create_curved_tube("AngkorSpireL2", [(-0.18, 1.12, -0.167), (-0.18, 1.18, -0.160)], [0.019, 0.007], mat=mat_gold_bright)
    tower_r2 = add_subdivided_box("AngkorTowerR2", (0.040, 0.12, 0.014), (0.18, 1.06, -0.174), (math.radians(-6), 0, 0), mat=mat_gold, subsurf_levels=1)
    tower_r2_spire = create_curved_tube("AngkorSpireR2", [(0.18, 1.12, -0.167), (0.18, 1.18, -0.160)], [0.019, 0.007], mat=mat_gold_bright)

    # 4) Stepped Gallery Foundation (Tiered terraces connecting all towers)
    angkor_terrace_up = add_subdivided_box("AngkorTerraceUp", (0.42, 0.026, 0.015), (0.0, 1.00, -0.198), (math.radians(-8), 0, 0), mat=mat_gold, subsurf_levels=1)
    angkor_terrace_mid = add_subdivided_box("AngkorTerraceMid", (0.46, 0.026, 0.015), (0.0, 0.96, -0.204), (math.radians(-8), 0, 0), mat=mat_gold, subsurf_levels=1)
    angkor_terrace_base = add_subdivided_box("AngkorTerraceBase", (0.50, 0.028, 0.015), (0.0, 0.92, -0.210), (math.radians(-8), 0, 0), mat=mat_gold_bright, subsurf_levels=1)

    cape_meshes.extend([
        cape_top, cape_upper, cape_mid, cape_lower, cape_trim,
        tower_c_body, tower_c_spire,
        tower_l1, tower_l1_spire, tower_r1, tower_r1_spire,
        tower_l2, tower_l2_spire, tower_r2, tower_r2_spire,
        angkor_terrace_up, angkor_terrace_mid, angkor_terrace_base
    ])

    # =========================================================================
    # 4. WAIST, BELT & RED-BROWN CHONG KBEN BREECHES (Pivot: X = 0, Y = 0.88, Z = 0)
    # =========================================================================
    belt = add_cylinder("HeroBelt", 0.21, 0.09, (0, 0.88, 0.01), three_scale=(1.05, 1.0, 0.95), mat=mat_leather)
    belt_trim_top = add_cylinder("BeltTrimTop", 0.215, 0.016, (0, 0.92, 0.01), three_scale=(1.05, 1.0, 0.95), mat=mat_gold)
    belt_trim_bot = add_cylinder("BeltTrimBot", 0.215, 0.016, (0, 0.84, 0.01), three_scale=(1.05, 1.0, 0.95), mat=mat_gold)
    buckle = add_cylinder("BeltBuckle", 0.068, 0.035, (0, 0.88, 0.21), three_rot=(math.pi / 2, 0, 0), mat=mat_gold_bright)
    buckle_gem = add_uv_sphere("BuckleGem", 0.032, (0, 0.88, 0.228), mat=mat_sapphire)

    # Red-Brown Chong Kben Pelvis (puffed traditional Cambodian breeches seamlessly meeting thighs)
    kben_pelvis = add_subdivided_box("KbenPelvis", (0.46, 0.32, 0.34), (0, 0.77, 0.0), mat=mat_kben, subsurf_levels=1)

    # Front Decorative Pleated Brocade Apron (Sabai flap hanging down center)
    apron = create_curved_tube(
        "FrontApron",
        [(0, 0.88, 0.21), (0, 0.74, 0.22), (0, 0.58, 0.205)],
        [0.055, 0.050, 0.042],
        mat=mat_teal_cowl
    )
    apron_pendant = add_subdivided_box("ApronPendant", (0.048, 0.048, 0.026), (0, 0.60, 0.215), (0, 0, math.pi / 4), mat=mat_gold)

    waist_meshes.extend([belt, belt_trim_top, belt_trim_bot, buckle, buckle_gem, kben_pelvis, apron, apron_pendant])

    # =========================================================================
    # 5. ARMS, VAMBRACES & TOUCH-TYPING HANDS (Pivots: X = +/- 0.34, Y = 1.38)
    # =========================================================================
    for s, side, arm_list in [(-1, 'L', arm_l_meshes), (1, 'R', arm_r_meshes)]:
        sx = s * 0.34
        # Upper Arm Sleeve: Cream/Beige cloth matching tunic
        sleeve_pts = [(sx, 1.38, 0.0), (sx, 1.27, 0.0), (sx, 1.16, 0.0)]
        sleeve = create_curved_tube(f"UpperSleeve_{side}", sleeve_pts, [0.088, 0.086, 0.080], mat=mat_beige_tunic)
        sleeve_trim = create_curved_tube(f"SleeveTrim_{side}", [(sx, 1.17, 0.0), (sx, 1.15, 0.0)], [0.085, 0.085], mat=mat_gold)

        # Forearm + Golden Leather Vambrace (kang dai)
        forearm_pts = [(sx, 1.16, 0.0), (sx, 1.06, 0.0), (sx, 0.96, 0.0)]
        forearm = create_curved_tube(f"ForearmSkin_{side}", forearm_pts, [0.072, 0.068, 0.064], mat=mat_skin)
        vam_pts = [(sx, 1.14, 0.0), (sx, 1.06, 0.0), (sx, 0.97, 0.0)]
        vam = create_curved_tube(f"VambraceLeather_{side}", vam_pts, [0.080, 0.076, 0.074], mat=mat_leather)
        vam_top = create_curved_tube(f"VambraceTop_{side}", [(sx, 1.14, 0.0), (sx, 1.12, 0.0)], [0.084, 0.084], mat=mat_gold_bright)
        vam_bot = create_curved_tube(f"VambraceBot_{side}", [(sx, 0.99, 0.0), (sx, 0.97, 0.0)], [0.078, 0.078], mat=mat_gold_bright)

        # Unified Hand with Wrist Cuff, Palm & 5 Modeled Touch-Typing Fingers
        hand_parts = create_unified_hand(side, s, sx, mat_skin, mat_gold_bright)
        arm_list.extend([sleeve, sleeve_trim, forearm, vam, vam_top, vam_bot] + hand_parts)

    # =========================================================================
    # 6. LEGS, ANKLE CUFFS & SCULPTED ADVENTURE BOOTS (Pivots: X = +/- 0.15, Y = 0.78)
    # =========================================================================
    for s, side, leg_list in [(-1, 'L', leg_l_meshes), (1, 'R', leg_r_meshes)]:
        lx = s * 0.15
        # Voluminous Chong Kben Puffed Thigh Breeches (puffed traditional Cambodian silhouette)
        thigh_pts = [(lx, 0.82, 0.0), (lx, 0.65, 0.0), (lx, 0.48, 0.0)]
        thigh = create_curved_tube(f"LegKben_{side}", thigh_pts, [0.155, 0.145, 0.115], mat=mat_kben)
        knee_cuff = create_curved_tube(f"KneeBand_{side}", [(lx, 0.50, 0.0), (lx, 0.47, 0.0)], [0.116, 0.116], mat=mat_gold)

        # Lower Calf Skin
        calf_pts = [(lx, 0.48, 0.0), (lx, 0.32, 0.0), (lx, 0.16, 0.0)]
        calf = create_curved_tube(f"LowerCalf_{side}", calf_pts, [0.075, 0.068, 0.062], mat=mat_skin)

        # Golden Ankle Cuff / Kang Cheung
        ankle_cuff = create_curved_tube(f"AnkleCuff_{side}", [(lx, 0.18, 0.0), (lx, 0.13, 0.0)], [0.072, 0.072], mat=mat_gold)

        # Brown Adventure Boots with Turned-up Toe and Gold Straps (matches reference)
        boot_shaft = create_curved_tube(f"BootShaft_{side}", [(lx, 0.14, 0.0), (lx, 0.07, 0.01)], [0.068, 0.072], mat=mat_boots)
        boot_foot = add_subdivided_box(f"BootFoot_{side}", (0.11, 0.07, 0.22), (lx, 0.045, 0.04), mat=mat_boots, subsurf_levels=1)
        boot_sole = add_subdivided_box(f"BootSole_{side}", (0.12, 0.024, 0.24), (lx, 0.012, 0.04), mat=mat_leather, subsurf_levels=1)
        
        # Gold cross-strap ornaments on boots
        strap1 = create_curved_tube(
            f"BootStrap1_{side}",
            [(lx - 0.055, 0.04, 0.02), (lx, 0.082, 0.04), (lx + 0.055, 0.04, 0.02)],
            [0.014, 0.015, 0.014],
            mat=mat_gold
        )
        strap2 = create_curved_tube(
            f"BootStrap2_{side}",
            [(lx - 0.052, 0.04, 0.09), (lx, 0.078, 0.11), (lx + 0.052, 0.04, 0.09)],
            [0.014, 0.015, 0.014],
            mat=mat_gold
        )

        leg_list.extend([thigh, knee_cuff, calf, ankle_cuff, boot_shaft, boot_foot, boot_sole, strap1, strap2])

    # =========================================================================
    # 7. ASSEMBLE MODULAR HIERARCHY MATCHING CHARACTER.TSX EXACTLY
    # =========================================================================
    parts = [
        ("HeroHeadMesh", head_meshes, (0.0, 1.72, 0.0)),
        ("HeroChestMesh", chest_meshes, (0.0, 1.15, 0.0)),
        ("HeroCapeMesh", cape_meshes, (0.0, 1.44, -0.12)),
        ("HeroWaistMesh", waist_meshes, (0.0, 0.88, 0.0)),
        ("HeroLeftArmMesh", arm_l_meshes, (-0.34, 1.38, 0.0)),
        ("HeroRightArmMesh", arm_r_meshes, (0.34, 1.38, 0.0)),
        ("HeroLeftLegMesh", leg_l_meshes, (-0.15, 0.78, 0.0)),
        ("HeroRightLegMesh", leg_r_meshes, (0.15, 0.78, 0.0)),
    ]

    total_tris = 0
    exported_objects = []
    for part_name, obj_list, pivot in parts:
        res = assemble_part(part_name, obj_list, pivot)
        if res:
            empty, mesh = res
            exported_objects.extend([empty, mesh])
            total_tris += sum(len(p.vertices) - 2 for p in mesh.data.polygons)

    # =========================================================================
    # 8. EXPORT GLB
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
    # 9. STUDIO PREVIEW RENDERS (Front, Back & 3/4 Views)
    # Character centered at X=0, Y=0, Z=1.15, facing towards -Y.
    # =========================================================================
    os.makedirs(os.path.dirname(OUTPUT_PREVIEW_FRONT), exist_ok=True)
    scene = bpy.context.scene
    scene.render.image_settings.file_format = 'PNG'
    scene.render.resolution_x = 1024
    scene.render.resolution_y = 1024
    scene.render.film_transparent = True

    # Lights setup
    def add_light(name, ltype, loc, rot, energy, color):
        ldata = bpy.data.lights.new(name=name, type=ltype)
        ldata.energy = energy
        ldata.color = color
        lobj = bpy.data.objects.new(name, ldata)
        lobj.location = Vector(loc)
        lobj.rotation_euler = Euler(rot, 'XYZ')
        bpy.context.collection.objects.link(lobj)
        return lobj

    add_light("KeyLight", 'SUN', (2, -3, 3), (math.radians(50), math.radians(20), math.radians(-30)), 3.6, (1.0, 0.95, 0.88))
    add_light("FillLight", 'SUN', (-2, -3, 2), (math.radians(40), math.radians(-30), math.radians(45)), 2.0, (0.75, 0.85, 1.0))
    add_light("BackLight", 'SUN', (0, 3, 2.5), (math.radians(-50), 0, 0), 3.4, (1.0, 0.92, 0.70))

    cam_data = bpy.data.cameras.new("StudioCam")
    cam_data.lens = 45
    cam_obj = bpy.data.objects.new("StudioCam", cam_data)
    bpy.context.collection.objects.link(cam_obj)
    scene.camera = cam_obj

    # 1. Front View
    cam_obj.location = Vector((0.0, -3.7, 1.15))
    cam_obj.rotation_euler = Euler((math.radians(90), 0, 0), 'XYZ')
    scene.render.filepath = OUTPUT_PREVIEW_FRONT
    bpy.ops.render.render(write_still=True)

    # 2. Back View (showcasing the Golden Angkor Wat cape!)
    cam_obj.location = Vector((0.0, 3.7, 1.15))
    cam_obj.rotation_euler = Euler((math.radians(90), 0, math.radians(180)), 'XYZ')
    scene.render.filepath = OUTPUT_PREVIEW_BACK
    bpy.ops.render.render(write_still=True)

    # 3. 3/4 View
    cam_obj.location = Vector((2.6, -2.6, 1.30))
    cam_obj.rotation_euler = Euler((math.radians(78), 0, math.radians(45)), 'XYZ')
    scene.render.filepath = OUTPUT_PREVIEW_THREE_QUARTER
    bpy.ops.render.render(write_still=True)

    file_size_kb = os.path.getsize(OUTPUT_GLB) / 1024.0
    print(f"\nSUCCESS: Exported {OUTPUT_GLB} ({file_size_kb:.1f} KB, {len(parts)} modular parts, {total_tris} triangles)")
    print(f"Rendered Front preview to: {OUTPUT_PREVIEW_FRONT}")
    print(f"Rendered Back preview to: {OUTPUT_PREVIEW_BACK}")
    print(f"Rendered 3/4 preview to: {OUTPUT_PREVIEW_THREE_QUARTER}")


if __name__ == "__main__":
    build_stylized_hero()

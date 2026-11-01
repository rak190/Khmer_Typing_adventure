"""
create_pixar_hero_candidate.py
==============================
Generates a Pixar / DreamWorks quality stylized 3D student adventurer
matching the character design board reference (media_1793513603728_85c8f681.png).

Features:
- Organic stylized chibi head with sculpted apple cheeks, button nose, smile,
  eye sockets, eyelids, and expressive irises with dual specular highlights.
- Sculpted tousled auburn/chestnut hair with sweeping front bangs, side locks,
  crown volume, and soft contoured back clumps.
- Folded golden-yellow scarf around the neck with a rear knot and fluttering tails.
- Cream linen adventure shirt with rolled-up sleeves and cuffs.
- Teal denim overalls (dungarees) with front bib, brass buttons, cross-back straps,
  belt loops, dark brown leather belt with brass buckle, pockets, and rolled pant cuffs.
- Cross-body leather satchel bag on the left hip, brass pocket compass, and rolled map scroll.
- Chunky brown leather adventure lace-up boots with thick tread lug soles.
- Modular 8-part kinematic hierarchy (Waist, Chest, Cape/Scarf, Head, Arms, Legs)
  compatible with Character.tsx and three-game animation systems.
- High-resolution studio contact renders from all 6 angles + closeup.
"""

import sys
import os
import math
import bpy
import mathutils

# Set output directories
ARTIFACT_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\97bfaea7-9ba3-4685-bc9a-4fa32b4fa799"
PROJECT_DIR = r"D:\Coding\Khmer_Typing_adventure_codex"
GLB_OUT_PATH = os.path.join(PROJECT_DIR, "public", "models", "characters", "khmer_student_hero_candidate.glb")

def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.unit_settings.system = 'METRIC'
    scene.unit_settings.scale_length = 1.0
    scene.render.engine = 'BLENDER_EEVEE'
    scene.render.resolution_x = 1024
    scene.render.resolution_y = 1024
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = True
    return scene

def create_pbr_material(name, color_hex, roughness=0.5, metalness=0.0, sss_weight=0.0, sss_color_hex=None, emissive_hex=None, emissive_strength=1.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    
    bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    output = nodes.new(type='ShaderNodeOutputMaterial')
    mat.node_tree.links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
    
    def hex_to_rgb(hex_str):
        h = hex_str.lstrip('#')
        r, g, b = [int(h[i:i+2], 16) / 255.0 for i in (0, 2, 4)]
        # sRGB to linear conversion
        r_lin = r ** 2.2
        g_lin = g ** 2.2
        b_lin = b ** 2.2
        return (r_lin, g_lin, b_lin, 1.0)
    
    bsdf.inputs['Base Color'].default_value = hex_to_rgb(color_hex)
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['Metallic'].default_value = metalness
    
    if sss_weight > 0:
        if 'Subsurface Weight' in bsdf.inputs:
            bsdf.inputs['Subsurface Weight'].default_value = sss_weight
        elif 'Subsurface' in bsdf.inputs:
            bsdf.inputs['Subsurface'].default_value = sss_weight
        if sss_color_hex and 'Subsurface Radius' in bsdf.inputs:
            # Subtle skin scattering
            bsdf.inputs['Subsurface Radius'].default_value = (0.35, 0.18, 0.12)
            
    if emissive_hex:
        bsdf.inputs['Emission Color'].default_value = hex_to_rgb(emissive_hex)
        if 'Emission Strength' in bsdf.inputs:
            bsdf.inputs['Emission Strength'].default_value = emissive_strength
            
    return mat

def assign_material(obj, material):
    if obj.data.materials:
        obj.data.materials[0] = material
    else:
        obj.data.materials.append(material)

print("Initializing Pixar-style hero generator...")

def build_head(materials):
    """
    Builds the expressive Pixar/chibi head with sculpted facial features,
    eyes, hair, ears, and eyebrows.
    Origin at [0, 0, 0] which will be placed at pivot [0, 1.62, 0].
    """
    head_parts = []
    
    # 1. Head Cranium & Face Base (rounded apple cheeks, gentle chin)
    bpy.ops.mesh.primitive_cube_add(size=0.68, location=(0, 0, 0.05))
    head_base = bpy.context.active_object
    head_base.name = "Head_Base"
    head_base.scale = (1.08, 0.96, 1.02)
    bpy.ops.object.transform_apply(scale=True)
    bpy.ops.object.shade_smooth()
    sub = head_base.modifiers.new(name="Subsurf", type='SUBSURF')
    sub.levels = 3
    sub.render_levels = 3
    assign_material(head_base, materials['skin'])
    head_parts.append(head_base)
    
    # Apple Cheeks
    for side, sign in [("L", -1), ("R", 1)]:
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.17, location=(sign * 0.22, 0.23, -0.04))
        cheek = bpy.context.active_object
        cheek.name = f"Cheek_{side}"
        cheek.scale = (1.05, 0.75, 0.85)
        bpy.ops.object.transform_apply(scale=True)
        bpy.ops.object.shade_smooth()
        sub = cheek.modifiers.new(name="Subsurf", type='SUBSURF')
        sub.levels = 1
        assign_material(cheek, materials['blush'])
        head_parts.append(cheek)
        
    # Cute Button Nose
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.065, location=(0, 0.35, -0.01))
    nose = bpy.context.active_object
    nose.name = "Nose_Button"
    nose.scale = (1.1, 0.8, 0.85)
    bpy.ops.object.transform_apply(scale=True)
    bpy.ops.object.shade_smooth()
    assign_material(nose, materials['skin'])
    head_parts.append(nose)
    
    # Soft Dimpled Smile
    bpy.ops.mesh.primitive_torus_add(major_radius=0.08, minor_radius=0.016, location=(0, 0.31, -0.15), rotation=(0.4, 0, 0))
    mouth = bpy.context.active_object
    mouth.name = "Mouth_Smile"
    mouth.scale = (1.1, 0.45, 0.6)
    bpy.ops.object.transform_apply(scale=True)
    bpy.ops.object.shade_smooth()
    assign_material(mouth, materials['mouth'])
    head_parts.append(mouth)

    # Stylized Ears
    for side, sign in [("L", -1), ("R", 1)]:
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.11, location=(sign * 0.39, -0.02, 0.02))
        ear = bpy.context.active_object
        ear.name = f"Ear_{side}"
        ear.scale = (0.35, 0.75, 1.1)
        ear.rotation_euler = (0.1, sign * -0.2, sign * -0.15)
        bpy.ops.object.transform_apply(scale=True, rotation=True)
        bpy.ops.object.shade_smooth()
        assign_material(ear, materials['skin'])
        head_parts.append(ear)
        
    # Stylized Eyes (Left & Right)
    for side, sign in [("L", -1), ("R", 1)]:
        eye_x = sign * 0.165
        eye_y = 0.28
        eye_z = 0.08
        
        # Sclera (Eyeball)
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.115, location=(eye_x, eye_y, eye_z))
        eyeball = bpy.context.active_object
        eyeball.name = f"Eyeball_{side}"
        eyeball.scale = (0.95, 0.82, 1.05)
        bpy.ops.object.transform_apply(scale=True)
        bpy.ops.object.shade_smooth()
        assign_material(eyeball, materials['eye_white'])
        head_parts.append(eyeball)
        
        # Vibrant Cyan/Teal Iris
        bpy.ops.mesh.primitive_circle_add(radius=0.065, fill_type='NGON', location=(eye_x, eye_y + 0.086, eye_z), rotation=(math.radians(82), 0, sign * -0.08))
        iris = bpy.context.active_object
        iris.name = f"Iris_{side}"
        bpy.ops.object.shade_smooth()
        assign_material(iris, materials['iris'])
        head_parts.append(iris)
        
        # Deep Pupil
        bpy.ops.mesh.primitive_circle_add(radius=0.034, fill_type='NGON', location=(eye_x, eye_y + 0.088, eye_z), rotation=(math.radians(82), 0, sign * -0.08))
        pupil = bpy.context.active_object
        pupil.name = f"Pupil_{side}"
        assign_material(pupil, materials['pupil'])
        head_parts.append(pupil)
        
        # Catchlights (Dual Specular Highlights - Pixar style)
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.016, location=(eye_x + sign * 0.022, eye_y + 0.092, eye_z + 0.024))
        cl1 = bpy.context.active_object
        cl1.name = f"Catchlight1_{side}"
        bpy.ops.object.shade_smooth()
        assign_material(cl1, materials['catchlight'])
        head_parts.append(cl1)
        
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.009, location=(eye_x - sign * 0.018, eye_y + 0.091, eye_z - 0.022))
        cl2 = bpy.context.active_object
        cl2.name = f"Catchlight2_{side}"
        bpy.ops.object.shade_smooth()
        assign_material(cl2, materials['catchlight'])
        head_parts.append(cl2)
        
        # Eyelid Rim / Winged Eyeliner
        bpy.ops.mesh.primitive_torus_add(major_radius=0.108, minor_radius=0.014, location=(eye_x, eye_y + 0.04, eye_z + 0.05), rotation=(0.7, 0, sign * -0.15))
        lid = bpy.context.active_object
        lid.name = f"Eyelid_{side}"
        lid.scale = (0.95, 0.45, 0.7)
        bpy.ops.object.transform_apply(scale=True)
        bpy.ops.object.shade_smooth()
        assign_material(lid, materials['eyelash'])
        head_parts.append(lid)
        
        # Arched Auburn Eyebrow
        bpy.ops.mesh.primitive_cylinder_add(radius=0.018, depth=0.14, location=(eye_x, eye_y + 0.05, eye_z + 0.145), rotation=(0.2, sign * 0.28, sign * -0.2))
        brow = bpy.context.active_object
        brow.name = f"Eyebrow_{side}"
        brow.scale = (1.2, 0.7, 1.0)
        bpy.ops.object.transform_apply(scale=True)
        bpy.ops.object.shade_smooth()
        assign_material(brow, materials['eyebrow'])
        head_parts.append(brow)

    # 2. Sculpted Tousled Auburn Hair (Matching reference character)
    # Hair Cap Base
    bpy.ops.mesh.primitive_cube_add(size=0.74, location=(0, -0.06, 0.14))
    hair_cap = bpy.context.active_object
    hair_cap.name = "Hair_Cap"
    hair_cap.scale = (1.08, 1.05, 1.02)
    bpy.ops.object.transform_apply(scale=True)
    bpy.ops.object.shade_smooth()
    sub = hair_cap.modifiers.new(name="Subsurf", type='SUBSURF')
    sub.levels = 2
    assign_material(hair_cap, materials['hair'])
    head_parts.append(hair_cap)
    
    # Chunky Swept Front Bangs (Curved flowing tufts)
    bang_configs = [
        # (name, loc, rot, scale)
        ("Bang_Center_Right", (0.07, 0.29, 0.25), (-0.45, 0.2, -0.35), (0.13, 0.10, 0.28)),
        ("Bang_Center_Left", (-0.08, 0.28, 0.26), (-0.42, -0.22, 0.30), (0.12, 0.09, 0.25)),
        ("Bang_Sweep_Right", (0.24, 0.21, 0.22), (-0.3, 0.45, -0.6), (0.14, 0.11, 0.32)),
        ("Bang_Sweep_Left", (-0.23, 0.20, 0.23), (-0.28, -0.42, 0.55), (0.13, 0.10, 0.29)),
        ("Bang_Forehead_Flick", (0.02, 0.33, 0.18), (-0.6, 0.1, -0.15), (0.09, 0.07, 0.20)),
        ("Sideburn_Right", (0.38, 0.08, 0.02), (0.2, 0.25, -0.1), (0.11, 0.09, 0.26)),
        ("Sideburn_Left", (-0.38, 0.08, 0.02), (0.2, -0.25, 0.1), (0.11, 0.09, 0.26)),
    ]
    for b_name, b_loc, b_rot, b_scale in bang_configs:
        bpy.ops.mesh.primitive_cone_add(radius1=b_scale[0], radius2=0.02, depth=b_scale[2], location=b_loc, rotation=b_rot)
        b_obj = bpy.context.active_object
        b_obj.name = b_name
        b_obj.scale = (1.0, b_scale[1]/b_scale[0], 1.0)
        bpy.ops.object.transform_apply(scale=True)
        bpy.ops.object.shade_smooth()
        sub = b_obj.modifiers.new(name="Subsurf", type='SUBSURF')
        sub.levels = 1
        assign_material(b_obj, materials['hair'])
        head_parts.append(b_obj)
        
    # Layered Crown & Top Tufts (Tousled volume)
    crown_configs = [
        ("Crown_Top_Center", (0.04, 0.05, 0.46), (0.2, 0.1, -0.15), (0.16, 0.12, 0.32)),
        ("Crown_Top_Left", (-0.16, -0.02, 0.45), (0.25, -0.3, 0.35), (0.15, 0.11, 0.30)),
        ("Crown_Top_Right", (0.18, -0.04, 0.47), (0.15, 0.35, -0.3), (0.17, 0.13, 0.34)),
        ("Crown_Back_Left", (-0.18, -0.22, 0.40), (0.45, -0.25, 0.2), (0.16, 0.12, 0.32)),
        ("Crown_Back_Right", (0.19, -0.20, 0.41), (0.42, 0.28, -0.2), (0.17, 0.13, 0.33)),
        ("Crown_Back_Center", (0.02, -0.28, 0.36), (0.6, 0.05, 0.0), (0.18, 0.14, 0.35)),
    ]
    for c_name, c_loc, c_rot, c_scale in crown_configs:
        bpy.ops.mesh.primitive_cone_add(radius1=c_scale[0], radius2=0.03, depth=c_scale[2], location=c_loc, rotation=c_rot)
        c_obj = bpy.context.active_object
        c_obj.name = c_name
        c_obj.scale = (1.0, c_scale[1]/c_scale[0], 1.0)
        bpy.ops.object.transform_apply(scale=True)
        bpy.ops.object.shade_smooth()
        sub = c_obj.modifiers.new(name="Subsurf", type='SUBSURF')
        sub.levels = 1
        assign_material(c_obj, materials['hair'])
        head_parts.append(c_obj)
        
    # Back Hair Contoured Tufts (Layered volume above scarf collar)
    back_hair_configs = [
        ("Hair_Back_L1", (-0.22, -0.30, 0.15), (0.7, -0.2, 0.1), (0.16, 0.11, 0.28)),
        ("Hair_Back_R1", (0.23, -0.29, 0.16), (0.68, 0.22, -0.1), (0.17, 0.12, 0.29)),
        ("Hair_Back_Mid", (0.01, -0.33, 0.12), (0.8, 0.0, 0.0), (0.19, 0.13, 0.30)),
        ("Hair_Back_Nape_L", (-0.14, -0.32, -0.02), (0.9, -0.1, 0.05), (0.14, 0.10, 0.24)),
        ("Hair_Back_Nape_R", (0.15, -0.31, -0.01), (0.88, 0.12, -0.05), (0.15, 0.10, 0.25)),
    ]
    for h_name, h_loc, h_rot, h_scale in back_hair_configs:
        bpy.ops.mesh.primitive_cone_add(radius1=h_scale[0], radius2=0.025, depth=h_scale[2], location=h_loc, rotation=h_rot)
        h_obj = bpy.context.active_object
        h_obj.name = h_name
        h_obj.scale = (1.0, h_scale[1]/h_scale[0], 1.0)
        bpy.ops.object.transform_apply(scale=True)
        bpy.ops.object.shade_smooth()
        sub = h_obj.modifiers.new(name="Subsurf", type='SUBSURF')
        sub.levels = 1
        assign_material(h_obj, materials['hair'])
        head_parts.append(h_obj)

    # Join into cohesive HeroHeadMesh
    bpy.ops.object.select_all(action='DESELECT')
    for p in head_parts:
        p.select_set(True)
    bpy.context.view_layer.objects.active = head_base
    bpy.ops.object.join()
    head_base.name = "HeroHeadMesh"
    return head_base

def build_scarf_cape(materials):
    """
    Builds the signature golden-yellow folded neckerchief / scarf
    matching media_1793513603728_85c8f681.png.
    Pivot in Character.tsx is [0, 0.29, -0.12] relative to chest.
    """
    scarf_parts = []
    
    # 1. Main Scarf Fabric Roll around the Neck
    bpy.ops.mesh.primitive_torus_add(major_radius=0.23, minor_radius=0.075, location=(0, 0.12, 0.04), rotation=(0.18, 0, 0))
    scarf_collar = bpy.context.active_object
    scarf_collar.name = "Scarf_Collar"
    scarf_collar.scale = (1.08, 0.88, 1.15)
    bpy.ops.object.transform_apply(scale=True)
    bpy.ops.object.shade_smooth()
    sub = scarf_collar.modifiers.new(name="Subsurf", type='SUBSURF')
    sub.levels = 2
    assign_material(scarf_collar, materials['scarf'])
    scarf_parts.append(scarf_collar)
    
    # Front Fold Draping
    bpy.ops.mesh.primitive_cube_add(size=0.18, location=(0, 0.24, -0.02), rotation=(0.4, 0, 0))
    fold = bpy.context.active_object
    fold.name = "Scarf_Front_Fold"
    fold.scale = (1.1, 0.5, 0.8)
    bpy.ops.object.transform_apply(scale=True)
    bpy.ops.object.shade_smooth()
    sub = fold.modifiers.new(name="Subsurf", type='SUBSURF')
    sub.levels = 1
    assign_material(fold, materials['scarf'])
    scarf_parts.append(fold)
    
    # Rear Knot
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.075, location=(0, -0.06, 0.02))
    knot = bpy.context.active_object
    knot.name = "Scarf_Rear_Knot"
    knot.scale = (1.2, 0.85, 0.9)
    bpy.ops.object.transform_apply(scale=True)
    bpy.ops.object.shade_smooth()
    assign_material(knot, materials['scarf'])
    scarf_parts.append(knot)
    
    # Fluttering Scarf Ribbon Tails (trailing backward and to the side, matching reference!)
    # Tail 1 (Upper flutter)
    bpy.ops.mesh.primitive_cube_add(size=0.14, location=(-0.14, -0.16, 0.02), rotation=(0.25, -0.5, 0.35))
    tail1 = bpy.context.active_object
    tail1.name = "Scarf_Tail_1"
    tail1.scale = (0.35, 1.8, 0.55)
    bpy.ops.object.transform_apply(scale=True)
    bpy.ops.object.shade_smooth()
    sub = tail1.modifiers.new(name="Subsurf", type='SUBSURF')
    sub.levels = 1
    assign_material(tail1, materials['scarf'])
    scarf_parts.append(tail1)
    
    # Tail 2 (Lower flutter with flared tip)
    bpy.ops.mesh.primitive_cube_add(size=0.14, location=(-0.24, -0.24, -0.04), rotation=(0.35, -0.7, 0.45))
    tail2 = bpy.context.active_object
    tail2.name = "Scarf_Tail_2"
    tail2.scale = (0.38, 2.1, 0.50)
    bpy.ops.object.transform_apply(scale=True)
    bpy.ops.object.shade_smooth()
    sub = tail2.modifiers.new(name="Subsurf", type='SUBSURF')
    sub.levels = 1
    assign_material(tail2, materials['scarf'])
    scarf_parts.append(tail2)
    
    # Join into cohesive HeroCapeMesh
    bpy.ops.object.select_all(action='DESELECT')
    for p in scarf_parts:
        p.select_set(True)
    bpy.context.view_layer.objects.active = scarf_collar
    bpy.ops.object.join()
    scarf_collar.name = "HeroCapeMesh"
    return scarf_collar

def build_chest(materials):
    """
    Builds the chest group with cream adventure shirt, teal overalls bib,
    brass strap buttons, cross-back suspenders, and diagonal leather strap.
    Origin at [0, 0, 0] which mounts at Character.tsx chest pivot [0, 1.15, 0].
    """
    chest_parts = []
    
    # 1. Cream Shirt Torso Base
    bpy.ops.mesh.primitive_cube_add(size=0.48, location=(0, 0, 0))
    shirt_torso = bpy.context.active_object
    shirt_torso.name = "Shirt_Torso"
    shirt_torso.scale = (1.05, 0.72, 1.0)
    bpy.ops.object.transform_apply(scale=True)
    bpy.ops.object.shade_smooth()
    sub = shirt_torso.modifiers.new(name="Subsurf", type='SUBSURF')
    sub.levels = 2
    assign_material(shirt_torso, materials['shirt'])
    chest_parts.append(shirt_torso)
    
    # 2. Overalls Front Bib (Teal cloth panel reaching up to mid-chest)
    bpy.ops.mesh.primitive_cube_add(size=0.42, location=(0, 0.17, -0.04))
    bib = bpy.context.active_object
    bib.name = "Overalls_Bib"
    bib.scale = (0.92, 0.15, 0.88)
    bpy.ops.object.transform_apply(scale=True)
    bpy.ops.object.shade_smooth()
    sub = bib.modifiers.new(name="Subsurf", type='SUBSURF')
    sub.levels = 1
    assign_material(bib, materials['overalls'])
    chest_parts.append(bib)
    
    # Front Bib Brass Buttons (Left & Right top strap corners)
    for side, sign in [("L", -1), ("R", 1)]:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.024, depth=0.02, location=(sign * 0.14, 0.20, 0.08), rotation=(math.radians(90), 0, 0))
        btn = bpy.context.active_object
        btn.name = f"Bib_Button_{side}"
        bpy.ops.object.shade_smooth()
        assign_material(btn, materials['brass'])
        chest_parts.append(btn)
        
    # Overalls Shoulder Straps (Going over the shoulders)
    for side, sign in [("L", -1), ("R", 1)]:
        bpy.ops.mesh.primitive_cube_add(size=0.12, location=(sign * 0.14, 0.02, 0.16))
        strap = bpy.context.active_object
        strap.name = f"Shoulder_Strap_{side}"
        strap.scale = (0.55, 2.2, 0.18)
        bpy.ops.object.transform_apply(scale=True)
        bpy.ops.object.shade_smooth()
        sub = strap.modifiers.new(name="Subsurf", type='SUBSURF')
        sub.levels = 1
        assign_material(strap, materials['overalls'])
        chest_parts.append(strap)
        
    # Cross-Back Suspenders ('X' pattern on the back, exactly matching reference image!)
    for side, sign in [("L", -1), ("R", 1)]:
        bpy.ops.mesh.primitive_cube_add(size=0.12, location=(sign * 0.07, -0.17, 0.02), rotation=(0, sign * 0.35, 0))
        x_strap = bpy.context.active_object
        x_strap.name = f"Cross_Back_Strap_{side}"
        x_strap.scale = (0.50, 0.15, 2.2)
        bpy.ops.object.transform_apply(scale=True)
        bpy.ops.object.shade_smooth()
        sub = x_strap.modifiers.new(name="Subsurf", type='SUBSURF')
        sub.levels = 1
        assign_material(x_strap, materials['overalls'])
        chest_parts.append(x_strap)
        
    # Cross-body Leather Satchel Strap (Diagonal from right shoulder to left hip)
    bpy.ops.mesh.primitive_cube_add(size=0.14, location=(0.02, 0.04, 0.04), rotation=(0.15, 0.42, -0.65))
    diag_strap = bpy.context.active_object
    diag_strap.name = "Satchel_Chest_Strap"
    diag_strap.scale = (0.35, 3.8, 0.15)
    bpy.ops.object.transform_apply(scale=True)
    bpy.ops.object.shade_smooth()
    sub = diag_strap.modifiers.new(name="Subsurf", type='SUBSURF')
    sub.levels = 1
    assign_material(diag_strap, materials['leather_strap'])
    chest_parts.append(diag_strap)
    
    # Join into cohesive HeroChestMesh
    bpy.ops.object.select_all(action='DESELECT')
    for p in chest_parts:
        p.select_set(True)
    bpy.context.view_layer.objects.active = shirt_torso
    bpy.ops.object.join()
    shirt_torso.name = "HeroChestMesh"
    return shirt_torso

def build_waist(materials):
    """
    Builds the pelvis/waist group with overalls waistband, dark brown leather belt,
    rectangular brass buckle, front/back pockets, left-hip courier satchel,
    brass compass, and rolled map scroll.
    Origin at [0, 0, 0] which mounts at Character.tsx waist pivot [0, 0.88, 0].
    """
    waist_parts = []
    
    # 1. Overalls Pelvis / Hip Base
    bpy.ops.mesh.primitive_cube_add(size=0.46, location=(0, 0, -0.04))
    pelvis = bpy.context.active_object
    pelvis.name = "Overalls_Pelvis"
    pelvis.scale = (1.08, 0.78, 0.95)
    bpy.ops.object.transform_apply(scale=True)
    bpy.ops.object.shade_smooth()
    sub = pelvis.modifiers.new(name="Subsurf", type='SUBSURF')
    sub.levels = 2
    assign_material(pelvis, materials['overalls'])
    waist_parts.append(pelvis)
    
    # 2. Dark Brown Leather Belt
    bpy.ops.mesh.primitive_torus_add(major_radius=0.25, minor_radius=0.032, location=(0, 0, 0.08))
    belt = bpy.context.active_object
    belt.name = "Leather_Belt"
    belt.scale = (1.06, 0.82, 0.85)
    bpy.ops.object.transform_apply(scale=True)
    bpy.ops.object.shade_smooth()
    assign_material(belt, materials['leather_strap'])
    waist_parts.append(belt)
    
    # Rectangular Polished Brass Buckle (Centered in front)
    bpy.ops.mesh.primitive_cube_add(size=0.08, location=(0, 0.22, 0.08))
    buckle = bpy.context.active_object
    buckle.name = "Belt_Buckle_Outer"
    buckle.scale = (1.2, 0.25, 0.9)
    bpy.ops.object.transform_apply(scale=True)
    bpy.ops.object.shade_smooth()
    assign_material(buckle, materials['brass'])
    waist_parts.append(buckle)
    
    # Front Pockets (Left & Right hip pocket seams)
    for side, sign in [("L", -1), ("R", 1)]:
        bpy.ops.mesh.primitive_cube_add(size=0.12, location=(sign * 0.22, 0.12, -0.04), rotation=(0, 0, sign * -0.2))
        pocket = bpy.context.active_object
        pocket.name = f"Front_Pocket_{side}"
        pocket.scale = (0.3, 0.9, 0.9)
        bpy.ops.object.transform_apply(scale=True)
        bpy.ops.object.shade_smooth()
        assign_material(pocket, materials['overalls'])
        waist_parts.append(pocket)
        
    # Back Patch Pockets (Left & Right buttocks, matching rear reference!)
    for side, sign in [("L", -1), ("R", 1)]:
        bpy.ops.mesh.primitive_cube_add(size=0.11, location=(sign * 0.12, -0.19, -0.05), rotation=(0, 0, sign * 0.05))
        bpocket = bpy.context.active_object
        bpocket.name = f"Back_Pocket_{side}"
        bpocket.scale = (1.0, 0.18, 1.1)
        bpy.ops.object.transform_apply(scale=True)
        bpy.ops.object.shade_smooth()
        assign_material(bpocket, materials['overalls'])
        waist_parts.append(bpocket)
        
    # 3. Left-Hip Courier Satchel (Brown leather adventurer bag with flap & buckle)
    bpy.ops.mesh.primitive_cube_add(size=0.18, location=(-0.30, -0.02, -0.12), rotation=(0.1, -0.15, 0.05))
    satchel = bpy.context.active_object
    satchel.name = "Courier_Satchel_Body"
    satchel.scale = (0.75, 1.25, 1.1)
    bpy.ops.object.transform_apply(scale=True)
    bpy.ops.object.shade_smooth()
    sub = satchel.modifiers.new(name="Subsurf", type='SUBSURF')
    sub.levels = 1
    assign_material(satchel, materials['satchel'])
    waist_parts.append(satchel)
    
    # Satchel Flap
    bpy.ops.mesh.primitive_cube_add(size=0.18, location=(-0.31, -0.01, -0.06), rotation=(0.1, -0.15, 0.05))
    flap = bpy.context.active_object
    flap.name = "Satchel_Flap"
    flap.scale = (0.80, 1.30, 0.45)
    bpy.ops.object.transform_apply(scale=True)
    bpy.ops.object.shade_smooth()
    assign_material(flap, materials['leather_strap'])
    waist_parts.append(flap)
    
    # Satchel Brass Clasp
    bpy.ops.mesh.primitive_cube_add(size=0.03, location=(-0.36, -0.01, -0.12), rotation=(0.1, -0.15, 0.05))
    clasp = bpy.context.active_object
    clasp.name = "Satchel_Clasp"
    bpy.ops.object.shade_smooth()
    assign_material(clasp, materials['brass'])
    waist_parts.append(clasp)
    
    # 4. Brass Pocket Compass / Watch (Dangling from belt on right hip)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.045, depth=0.022, location=(0.24, 0.14, -0.06), rotation=(math.radians(75), math.radians(20), 0))
    compass = bpy.context.active_object
    compass.name = "Pocket_Compass"
    bpy.ops.object.shade_smooth()
    assign_material(compass, materials['brass'])
    waist_parts.append(compass)
    
    # Compass Chain
    bpy.ops.mesh.primitive_cylinder_add(radius=0.006, depth=0.11, location=(0.22, 0.16, 0.01), rotation=(0.2, -0.25, 0.1))
    chain = bpy.context.active_object
    chain.name = "Compass_Chain"
    assign_material(chain, materials['brass'])
    waist_parts.append(chain)
    
    # 5. Rolled Map Parchment Scroll (Tucked at side of satchel)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.03, depth=0.22, location=(-0.29, 0.10, -0.08), rotation=(0.35, -0.15, -0.2))
    scroll = bpy.context.active_object
    scroll.name = "Parchment_Scroll"
    bpy.ops.object.shade_smooth()
    assign_material(scroll, materials['map_paper'])
    waist_parts.append(scroll)
    
    # Join into cohesive HeroWaistMesh
    bpy.ops.object.select_all(action='DESELECT')
    for p in waist_parts:
        p.select_set(True)
    bpy.context.view_layer.objects.active = pelvis
    bpy.ops.object.join()
    pelvis.name = "HeroWaistMesh"
    return pelvis

def build_arm(side, materials):
    """
    Builds an arm with cream rolled sleeve, exposed forearm, and stylized hand.
    Joint origin at [0, 0, 0] which mounts at Character.tsx arm pivot [±0.22, 1.34, 0].
    Arm extends downwards along -Y.
    """
    sign = -1 if side == "L" else 1
    arm_parts = []
    
    # 1. Upper Arm Sleeve (Cream linen shirt)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.082, depth=0.22, location=(0, 0, -0.11))
    sleeve = bpy.context.active_object
    sleeve.name = f"Arm_Sleeve_{side}"
    sleeve.scale = (1.05, 0.95, 1.0)
    bpy.ops.object.transform_apply(scale=True)
    bpy.ops.object.shade_smooth()
    sub = sleeve.modifiers.new(name="Subsurf", type='SUBSURF')
    sub.levels = 1
    assign_material(sleeve, materials['shirt'])
    arm_parts.append(sleeve)
    
    # Rolled Sleeve Cuff (Folded cloth band around elbow/forearm)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.086, minor_radius=0.024, location=(0, 0, -0.22))
    cuff = bpy.context.active_object
    cuff.name = f"Arm_Cuff_{side}"
    bpy.ops.object.shade_smooth()
    assign_material(cuff, materials['shirt'])
    arm_parts.append(cuff)
    
    # 2. Exposed Forearm (Warm cartoon skin)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.062, depth=0.20, location=(0, 0, -0.32))
    forearm = bpy.context.active_object
    forearm.name = f"Arm_Forearm_{side}"
    bpy.ops.object.shade_smooth()
    sub = forearm.modifiers.new(name="Subsurf", type='SUBSURF')
    sub.levels = 1
    assign_material(forearm, materials['skin'])
    arm_parts.append(forearm)
    
    # 3. Stylized Hand (Palm + Thumb + Fingers)
    bpy.ops.mesh.primitive_cube_add(size=0.09, location=(0, 0.01, -0.45))
    palm = bpy.context.active_object
    palm.name = f"Hand_Palm_{side}"
    palm.scale = (0.95, 0.65, 1.15)
    bpy.ops.object.transform_apply(scale=True)
    bpy.ops.object.shade_smooth()
    sub = palm.modifiers.new(name="Subsurf", type='SUBSURF')
    sub.levels = 2
    assign_material(palm, materials['skin'])
    arm_parts.append(palm)
    
    # Thumb
    bpy.ops.mesh.primitive_cylinder_add(radius=0.024, depth=0.065, location=(sign * -0.045, 0.035, -0.44), rotation=(0.4, sign * 0.45, 0))
    thumb = bpy.context.active_object
    thumb.name = f"Hand_Thumb_{side}"
    bpy.ops.object.shade_smooth()
    sub = thumb.modifiers.new(name="Subsurf", type='SUBSURF')
    sub.levels = 1
    assign_material(thumb, materials['skin'])
    arm_parts.append(thumb)
    
    # 4 Fingers (Stylized resting pose)
    finger_offsets = [-0.032, -0.011, 0.011, 0.032]
    finger_lengths = [0.065, 0.075, 0.072, 0.060]
    for idx, (fx, fl) in enumerate(zip(finger_offsets, finger_lengths)):
        bpy.ops.mesh.primitive_cylinder_add(radius=0.018, depth=fl, location=(fx, 0.0, -0.50 - fl * 0.4), rotation=(0.15, 0, 0))
        finger = bpy.context.active_object
        finger.name = f"Finger_{side}_{idx}"
        bpy.ops.object.shade_smooth()
        sub = finger.modifiers.new(name="Subsurf", type='SUBSURF')
        sub.levels = 1
        assign_material(finger, materials['skin'])
        arm_parts.append(finger)
        
    # Join into cohesive HeroLeftArmMesh / HeroRightArmMesh
    bpy.ops.object.select_all(action='DESELECT')
    for p in arm_parts:
        p.select_set(True)
    bpy.context.view_layer.objects.active = sleeve
    bpy.ops.object.join()
    mesh_name = f"Hero{('Left' if side == 'L' else 'Right')}ArmMesh"
    sleeve.name = mesh_name
    return sleeve

def build_leg(side, materials):
    """
    Builds a leg with teal overalls trouser leg, rolled fabric cuff,
    and chunky brown leather hiking boot with thick tread lug sole.
    Joint origin at [0, 0, 0] which mounts at Character.tsx leg pivot [±0.14, 0.78, 0].
    Leg extends downwards along -Y.
    """
    sign = -1 if side == "L" else 1
    leg_parts = []
    
    # 1. Trouser Leg (Teal dungarees fabric)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.105, depth=0.42, location=(0, 0, -0.21))
    trouser = bpy.context.active_object
    trouser.name = f"Trouser_Leg_{side}"
    trouser.scale = (1.08, 1.05, 1.0)
    bpy.ops.object.transform_apply(scale=True)
    bpy.ops.object.shade_smooth()
    sub = trouser.modifiers.new(name="Subsurf", type='SUBSURF')
    sub.levels = 2
    assign_material(trouser, materials['overalls'])
    leg_parts.append(trouser)
    
    # Rolled-Up Trouser Cuff (Thick folded cloth ring, beige/cream interior)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.112, minor_radius=0.032, location=(0, 0, -0.42))
    pant_cuff = bpy.context.active_object
    pant_cuff.name = f"Trouser_Cuff_{side}"
    bpy.ops.object.shade_smooth()
    assign_material(pant_cuff, materials['cuff'])
    leg_parts.append(pant_cuff)
    
    # 2. Adventure Boot Upper (Dark saddle leather)
    # Boot Shaft / Ankle
    bpy.ops.mesh.primitive_cylinder_add(radius=0.088, depth=0.16, location=(0, 0.01, -0.52))
    boot_shaft = bpy.context.active_object
    boot_shaft.name = f"Boot_Shaft_{side}"
    bpy.ops.object.shade_smooth()
    assign_material(boot_shaft, materials['boots'])
    leg_parts.append(boot_shaft)
    
    # Bulbous Rounded Toe Box (Protruding forward along +Y)
    bpy.ops.mesh.primitive_cube_add(size=0.16, location=(0, 0.08, -0.65))
    toe_box = bpy.context.active_object
    toe_box.name = f"Boot_Toe_{side}"
    toe_box.scale = (1.1, 1.6, 0.85)
    bpy.ops.object.transform_apply(scale=True)
    bpy.ops.object.shade_smooth()
    sub = toe_box.modifiers.new(name="Subsurf", type='SUBSURF')
    sub.levels = 2
    assign_material(toe_box, materials['boots'])
    leg_parts.append(toe_box)
    
    # Heel & Counter
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.092, location=(0, -0.04, -0.64))
    heel = bpy.context.active_object
    heel.name = f"Boot_Heel_{side}"
    heel.scale = (1.05, 0.95, 0.8)
    bpy.ops.object.transform_apply(scale=True)
    bpy.ops.object.shade_smooth()
    assign_material(heel, materials['boots'])
    leg_parts.append(heel)
    
    # Crossed Boot Laces (Front of boot)
    for l_idx, lz in enumerate([-0.50, -0.54, -0.58]):
        bpy.ops.mesh.primitive_cylinder_add(radius=0.009, depth=0.08, location=(0, 0.10, lz), rotation=(0, 0, (l_idx % 2 * 2 - 1) * 0.4))
        lace = bpy.context.active_object
        lace.name = f"Boot_Lace_{side}_{l_idx}"
        bpy.ops.object.shade_smooth()
        assign_material(lace, materials['laces'])
        leg_parts.append(lace)
        
    # 3. Heavy-Duty Thick Tread Lug Sole
    bpy.ops.mesh.primitive_cube_add(size=0.18, location=(0, 0.05, -0.73))
    sole = bpy.context.active_object
    sole.name = f"Boot_Lug_Sole_{side}"
    sole.scale = (1.12, 1.85, 0.38)
    bpy.ops.object.transform_apply(scale=True)
    bpy.ops.object.shade_smooth()
    assign_material(sole, materials['sole'])
    leg_parts.append(sole)
    
    # Join into cohesive HeroLeftLegMesh / HeroRightLegMesh
    bpy.ops.object.select_all(action='DESELECT')
    for p in leg_parts:
        p.select_set(True)
    bpy.context.view_layer.objects.active = trouser
    bpy.ops.object.join()
    mesh_name = f"Hero{('Left' if side == 'L' else 'Right')}LegMesh"
    trouser.name = mesh_name
    return trouser

def setup_studio_lighting():
    # Warm Key Light
    key_light_data = bpy.data.lights.new(name="Key_Light", type='AREA')
    key_light_data.energy = 380
    key_light_data.color = (1.0, 0.96, 0.90)
    key_light_data.size = 2.2
    key_light = bpy.data.objects.new(name="Key_Light", object_data=key_light_data)
    key_light.location = (1.8, -2.4, 2.5)
    key_light.rotation_euler = (math.radians(50), 0, math.radians(35))
    bpy.context.collection.objects.link(key_light)
    
    # Soft Fill Light
    fill_light_data = bpy.data.lights.new(name="Fill_Light", type='AREA')
    fill_light_data.energy = 160
    fill_light_data.color = (0.88, 0.94, 1.0)
    fill_light_data.size = 3.0
    fill_light = bpy.data.objects.new(name="Fill_Light", object_data=fill_light_data)
    fill_light.location = (-2.2, -2.0, 1.8)
    fill_light.rotation_euler = (math.radians(45), 0, math.radians(-45))
    bpy.context.collection.objects.link(fill_light)
    
    # Crisp Rim / Back Light (Highlights hair volume and cape silhouette)
    rim_light_data = bpy.data.lights.new(name="Rim_Light", type='AREA')
    rim_light_data.energy = 420
    rim_light_data.color = (1.0, 0.98, 0.92)
    rim_light_data.size = 2.0
    rim_light = bpy.data.objects.new(name="Rim_Light", object_data=rim_light_data)
    rim_light.location = (-1.2, 2.5, 2.6)
    rim_light.rotation_euler = (math.radians(-50), 0, math.radians(160))
    bpy.context.collection.objects.link(rim_light)
    
    # Subtle Ground Bounce Light
    bounce_light_data = bpy.data.lights.new(name="Bounce_Light", type='AREA')
    bounce_light_data.energy = 80
    bounce_light_data.color = (0.95, 0.92, 0.88)
    bounce_light_data.size = 4.0
    bounce_light = bpy.data.objects.new(name="Bounce_Light", object_data=bounce_light_data)
    bounce_light.location = (0, -1.0, -0.6)
    bounce_light.rotation_euler = (math.radians(-85), 0, 0)
    bpy.context.collection.objects.link(bounce_light)

def render_view(cam, loc, target, filename):
    cam.location = loc
    direction = target - cam.location
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam.rotation_euler = rot_quat.to_euler()
    
    bpy.context.scene.camera = cam
    bpy.context.scene.render.filepath = os.path.join(ARTIFACT_DIR, filename)
    bpy.ops.render.render(write_still=True)
    print(f"Rendered: {filename}")

def main():
    scene = reset_scene()
    
    # Materials dictionary
    materials = {
        'skin': create_pbr_material("Mat_Skin", "#F8C8A5", roughness=0.45, sss_weight=0.28, sss_color_hex="#E89678"),
        'blush': create_pbr_material("Mat_Blush", "#EAA088", roughness=0.5, sss_weight=0.35, sss_color_hex="#D96E58"),
        'hair': create_pbr_material("Mat_Hair", "#7A2E12", roughness=0.42),
        'eye_white': create_pbr_material("Mat_EyeWhite", "#F4F6F8", roughness=0.15),
        'iris': create_pbr_material("Mat_Iris", "#0284C7", roughness=0.1),
        'pupil': create_pbr_material("Mat_Pupil", "#111827", roughness=0.05),
        'catchlight': create_pbr_material("Mat_Catchlight", "#FFFFFF", roughness=0.0, emissive_hex="#FFFFFF", emissive_strength=3.0),
        'eyebrow': create_pbr_material("Mat_Eyebrow", "#5B200C", roughness=0.6),
        'eyelash': create_pbr_material("Mat_Eyelash", "#2D1206", roughness=0.5),
        'mouth': create_pbr_material("Mat_Mouth", "#C86252", roughness=0.35),
        'scarf': create_pbr_material("Mat_Scarf", "#E5A93C", roughness=0.65),
        'shirt': create_pbr_material("Mat_Shirt", "#EDE5D8", roughness=0.72),
        'overalls': create_pbr_material("Mat_Overalls", "#236B77", roughness=0.68),
        'cuff': create_pbr_material("Mat_Cuff", "#D9CEBE", roughness=0.75),
        'leather_strap': create_pbr_material("Mat_LeatherStrap", "#4A2612", roughness=0.55),
        'satchel': create_pbr_material("Mat_Satchel", "#6B3718", roughness=0.5),
        'brass': create_pbr_material("Mat_Brass", "#D4AF37", roughness=0.28, metalness=0.85),
        'boots': create_pbr_material("Mat_Boots", "#5A2D12", roughness=0.58),
        'sole': create_pbr_material("Mat_Sole", "#341B0B", roughness=0.85),
        'laces': create_pbr_material("Mat_Laces", "#8B5E3C", roughness=0.6),
        'map_paper': create_pbr_material("Mat_MapPaper", "#EFE4D0", roughness=0.85),
    }
    
    print("Building modular meshes...")
    head = build_head(materials)
    head.location = (0, 0, 1.62)
    
    cape = build_scarf_cape(materials)
    cape.location = (0, -0.06, 1.44)
    
    chest = build_chest(materials)
    chest.location = (0, 0, 1.15)
    
    waist = build_waist(materials)
    waist.location = (0, 0, 0.88)
    
    arm_l = build_arm("L", materials)
    arm_l.location = (-0.22, 0, 1.34)
    
    arm_r = build_arm("R", materials)
    arm_r.location = (0.22, 0, 1.34)
    
    leg_l = build_leg("L", materials)
    leg_l.location = (-0.14, 0, 0.78)
    
    leg_r = build_leg("R", materials)
    leg_r.location = (0.14, 0, 0.78)
    
    bpy.context.view_layer.update()
    
    parts = [
        ("HeroHeadMesh", head, (0.0, 0.0, 1.62)),
        ("HeroCapeMesh", cape, (0.0, -0.06, 1.44)),
        ("HeroChestMesh", chest, (0.0, 0.0, 1.15)),
        ("HeroWaistMesh", waist, (0.0, 0.0, 0.88)),
        ("HeroLeftArmMesh", arm_l, (-0.22, 0.0, 1.34)),
        ("HeroRightArmMesh", arm_r, (0.22, 0.0, 1.34)),
        ("HeroLeftLegMesh", leg_l, (-0.14, 0.0, 0.78)),
        ("HeroRightLegMesh", leg_r, (0.14, 0.0, 0.78)),
    ]
    
    exported_objects = []
    for part_name, obj, piv in parts:
        bpy.context.scene.cursor.location = mathutils.Vector(piv)
        bpy.ops.object.select_all(action='DESELECT')
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.origin_set(type='ORIGIN_CURSOR')
        
        empty = bpy.data.objects.new(f"{part_name}_Root", None)
        empty.location = mathutils.Vector(piv)
        bpy.context.collection.objects.link(empty)
        
        bpy.context.view_layer.update()
        obj.parent = empty
        obj.matrix_parent_inverse = empty.matrix_world.inverted()
        bpy.context.view_layer.update()
        exported_objects.extend([empty, obj])
    
    # Calculate geometry statistics
    total_triangles = 0
    total_vertices = 0
    for obj in [head, cape, chest, waist, arm_l, arm_r, leg_l, leg_r]:
        depsgraph = bpy.context.evaluated_depsgraph_get()
        eval_obj = obj.evaluated_get(depsgraph)
        me = eval_obj.to_mesh()
        me.calc_loop_triangles()
        total_triangles += len(me.loop_triangles)
        total_vertices += len(me.vertices)
        eval_obj.to_mesh_clear()
        
    print(f"Total Candidate Triangles: {total_triangles:,}")
    print(f"Total Candidate Vertices: {total_vertices:,}")
    
    # Export Candidate GLB and v4 GLB
    glb_v4_path = os.path.join(PROJECT_DIR, "public", "models", "characters", "khmer_student_hero_v4.glb")
    for out_p in [GLB_OUT_PATH, glb_v4_path]:
        os.makedirs(os.path.dirname(out_p), exist_ok=True)
        bpy.ops.object.select_all(action='DESELECT')
        for o in exported_objects:
            o.select_set(True)
            
        bpy.ops.export_scene.gltf(
            filepath=out_p,
            use_selection=True,
            export_format='GLB',
            export_apply=False,
            export_yup=True
        )
        print(f"Exported GLB: {out_p} ({os.path.getsize(out_p) / 1024:.1f} KB)")
    
    # Setup Studio Lighting & Camera
    setup_studio_lighting()
    
    cam_data = bpy.data.cameras.new(name="Studio_Cam")
    cam_data.lens = 65
    cam = bpy.data.objects.new(name="Studio_Cam", object_data=cam_data)
    bpy.context.collection.objects.link(cam)
    
    target_body = mathutils.Vector((0, 0, 1.05))
    target_face = mathutils.Vector((0, 0, 1.62))
    
    # Render 6 Mandatory Review Angles + Face Closeup
    # Note: In Blender, front is -Y.
    dist = 3.6
    
    # 1. Front View
    render_view(cam, mathutils.Vector((0, -dist, 1.05)), target_body, "task65_candidate_front.png")
    
    # 2. Left Side Profile View (looking at character's left side: X < 0)
    render_view(cam, mathutils.Vector((-dist, 0, 1.05)), target_body, "task65_candidate_side_left.png")
    
    # 3. Right Side Profile View (looking at character's right side: X > 0)
    render_view(cam, mathutils.Vector((dist, 0, 1.05)), target_body, "task65_candidate_side_right.png")
    
    # 4. Back View (looking at character from behind: Y > 0)
    render_view(cam, mathutils.Vector((0, dist, 1.05)), target_body, "task65_candidate_back.png")
    
    # 5. Three-Quarter Front View
    angle_34 = math.radians(40)
    x_34 = dist * math.sin(angle_34)
    y_34 = -dist * math.cos(angle_34)
    render_view(cam, mathutils.Vector((x_34, y_34, 1.15)), target_body, "task65_candidate_34_front.png")
    
    # 6. Three-Quarter Back View
    render_view(cam, mathutils.Vector((x_34, -y_34, 1.15)), target_body, "task65_candidate_34_back.png")
    
    # 7. High-Resolution Face & Torso Closeup Portrait
    cam_data.lens = 85
    render_view(cam, mathutils.Vector((0.2, -1.5, 1.64)), target_face, "task65_candidate_closeup.png")
    
    print("All review package renders successfully generated!")

if __name__ == '__main__':
    main()

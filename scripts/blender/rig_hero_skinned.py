"""
rig_hero_skinned.py
===================
Adds a complete Skinned Mesh Armature (Bones & Weights) to the Khmer Student Hero V3.
Assigns clean per-part vertex skinning weights so joints (elbows, knees, hips, torso, cape)
bend smoothly as a single cohesive character without tearing or cross-bleeding.
"""

import bpy
import bmesh
import os
import math
import shutil
from mathutils import Vector, Matrix, Euler

INPUT_GLB = os.path.abspath("public/models/characters/Khmer_Student_Hero_V3.glb")
OUTPUT_SKINNED_GLB = os.path.abspath("public/models/characters/Khmer_Student_Hero_Rigged.glb")
OUTPUT_RUNTIME_GLB = os.path.abspath("public/models/characters/khmer_student_hero.glb")
OUTPUT_PREVIEW_REST = r"C:\Users\Admin\.gemini\antigravity\brain\97bfaea7-9ba3-4685-bc9a-4fa32b4fa799\v3_rigged_rest.png"
OUTPUT_PREVIEW_POSE = r"C:\Users\Admin\.gemini\antigravity\brain\97bfaea7-9ba3-4685-bc9a-4fa32b4fa799\v3_rigged_pose.png"

def smoothstep(e0, e1, x):
    t = max(0.0, min(1.0, (x - e0) / (e1 - e0)))
    return t * t * (3.0 - 2.0 * t)

def run_rigging():
    # 1. Reset scene and import source GLB
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.unit_settings.system = 'METRIC'
    scene.unit_settings.scale_length = 1.0

    print("Importing:", INPUT_GLB)
    bpy.ops.import_scene.gltf(filepath=INPUT_GLB)

    mesh_objs = [o for o in bpy.data.objects if o.type == 'MESH']
    print(f"Loaded {len(mesh_objs)} mesh parts.")

    # Record parent empty name for each mesh
    part_groups = {}
    for o in mesh_objs:
        pname = o.parent.name if o.parent else "Misc"
        part_groups[o] = pname

    # Apply all world transforms to mesh vertices
    bpy.ops.object.select_all(action='DESELECT')
    for o in mesh_objs:
        mat = o.matrix_world.copy()
        o.parent = None
        o.matrix_world = mat
        o.select_set(True)

    bpy.context.view_layer.objects.active = mesh_objs[0]
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    # 2. Build Armature
    arm_data = bpy.data.armatures.new("KhmerHeroArmature")
    arm_obj = bpy.data.objects.new("KhmerHeroRig", arm_data)
    bpy.context.collection.objects.link(arm_obj)
    bpy.context.view_layer.objects.active = arm_obj
    bpy.ops.object.mode_set(mode='EDIT')

    edit_bones = arm_data.edit_bones

    def add_bone(name, head, tail, parent_name=None):
        b = edit_bones.new(name)
        b.head = Vector(head)
        b.tail = Vector(tail)
        if parent_name:
            b.parent = edit_bones[parent_name]
            b.use_connect = False
        return b

    # Central Spine Chain
    # (Blender coordinates: -Y is Forward, +Y is Back, +Z is Up, +X is Right)
    add_bone("Root", (0, 0, 0), (0, 0, 0.4))
    add_bone("Hips", (0, 0, 0.78), (0, 0, 1.05), "Root")
    add_bone("Spine", (0, 0, 1.05), (0, 0, 1.35), "Hips")
    add_bone("Chest", (0, 0, 1.35), (0, 0, 1.65), "Spine")
    add_bone("Neck", (0, 0, 1.65), (0, 0, 1.76), "Chest")
    add_bone("Head", (0, 0, 1.76), (0, 0, 2.32), "Neck")

    # Draped Cape Chain
    add_bone("Cape_01", (0, 0.16, 1.45), (0, 0.22, 1.15), "Chest")
    add_bone("Cape_02", (0, 0.22, 1.15), (0, 0.28, 0.75), "Cape_01")

    # Left Arm (-X, forward is -Y)
    add_bone("Shoulder_L", (0, 0, 1.44), (-0.25, 0, 1.42), "Chest")
    add_bone("UpperArm_L", (-0.25, 0, 1.42), (-0.34, 0, 1.15), "Shoulder_L")
    add_bone("Forearm_L", (-0.34, 0, 1.15), (-0.34, -0.02, 0.90), "UpperArm_L")
    add_bone("Hand_L", (-0.34, -0.02, 0.90), (-0.34, -0.03, 0.76), "Forearm_L")

    # Right Arm (+X, forward is -Y)
    add_bone("Shoulder_R", (0, 0, 1.44), (0.25, 0, 1.42), "Chest")
    add_bone("UpperArm_R", (0.25, 0, 1.42), (0.34, 0, 1.15), "Shoulder_R")
    add_bone("Forearm_R", (0.34, 0, 1.15), (0.34, -0.02, 0.90), "UpperArm_R")
    add_bone("Hand_R", (0.34, -0.02, 0.90), (0.34, -0.03, 0.76), "Forearm_R")

    # Left Leg (-X)
    add_bone("UpperLeg_L", (-0.155, 0, 0.78), (-0.155, 0, 0.45), "Hips")
    add_bone("LowerLeg_L", (-0.155, 0, 0.45), (-0.155, 0.02, 0.15), "UpperLeg_L")
    add_bone("Foot_L", (-0.155, 0.02, 0.15), (-0.155, -0.15, 0.02), "LowerLeg_L")

    # Right Leg (+X)
    add_bone("UpperLeg_R", (0.155, 0, 0.78), (0.155, 0, 0.45), "Hips")
    add_bone("LowerLeg_R", (0.155, 0, 0.45), (0.155, 0.02, 0.15), "UpperLeg_R")
    add_bone("Foot_R", (0.155, 0.02, 0.15), (0.155, -0.15, 0.02), "LowerLeg_R")

    bpy.ops.object.mode_set(mode='OBJECT')
    bone_names = [b.name for b in arm_data.bones]
    print(f"Armature constructed with {len(bone_names)} bones.")

    # 3. Assign Vertex Groups to each mesh object individually before joining
    for obj, region in part_groups.items():
        # Ensure all bone groups exist on this object
        vg = {b: obj.vertex_groups.new(name=b) for b in bone_names}

        for idx, v in enumerate(obj.data.vertices):
            x, y, z = v.co
            w = {}

            if region == "HeroHeadMesh":
                # Head, hair, diadem, smile, eyes never deform
                if z >= 1.68:
                    w["Head"] = 1.0
                else:
                    t = smoothstep(1.55, 1.68, z)
                    w["Head"] = t
                    w["Neck"] = 1.0 - t

            elif region == "HeroCapeMesh":
                if z >= 1.35:
                    t = smoothstep(1.35, 1.55, z)
                    w["Chest"] = t * 0.4
                    w["Cape_01"] = 1.0 - (t * 0.4)
                elif z >= 1.00:
                    t = smoothstep(1.00, 1.35, z)
                    w["Cape_01"] = t
                    w["Cape_02"] = 1.0 - t
                else:
                    w["Cape_02"] = 1.0

            elif region == "HeroLeftArmMesh":
                # Shoulder Z ~ 1.42, Elbow Z ~ 1.15, Wrist Z ~ 0.90
                if z >= 1.25:
                    t = smoothstep(1.25, 1.42, z)
                    w["UpperArm_L"] = 1.0 - (t * 0.25)
                    w["Shoulder_L"] = t * 0.25
                elif z >= 1.05:
                    # Elbow smooth transition
                    t = smoothstep(1.05, 1.25, z)
                    w["UpperArm_L"] = t
                    w["Forearm_L"] = 1.0 - t
                elif z >= 0.88:
                    t = smoothstep(0.88, 1.05, z)
                    w["Forearm_L"] = t
                    w["Hand_L"] = 1.0 - t
                else:
                    w["Hand_L"] = 1.0

            elif region == "HeroRightArmMesh":
                if z >= 1.25:
                    t = smoothstep(1.25, 1.42, z)
                    w["UpperArm_R"] = 1.0 - (t * 0.25)
                    w["Shoulder_R"] = t * 0.25
                elif z >= 1.05:
                    t = smoothstep(1.05, 1.25, z)
                    w["UpperArm_R"] = t
                    w["Forearm_R"] = 1.0 - t
                elif z >= 0.88:
                    t = smoothstep(0.88, 1.05, z)
                    w["Forearm_R"] = t
                    w["Hand_R"] = 1.0 - t
                else:
                    w["Hand_R"] = 1.0

            elif region == "HeroLeftLegMesh":
                # Thigh Z ~ 0.78, Knee Z ~ 0.45, Ankle Z ~ 0.15, Boot Z < 0.15
                if z >= 0.55:
                    t = smoothstep(0.55, 0.80, z)
                    w["UpperLeg_L"] = 1.0 - (t * 0.2)
                    w["Hips"] = t * 0.2
                elif z >= 0.38:
                    # Knee smooth transition
                    t = smoothstep(0.38, 0.55, z)
                    w["UpperLeg_L"] = t
                    w["LowerLeg_L"] = 1.0 - t
                elif z >= 0.18:
                    t = smoothstep(0.18, 0.38, z)
                    w["LowerLeg_L"] = t
                    w["Foot_L"] = 1.0 - t
                else:
                    w["Foot_L"] = 1.0

            elif region == "HeroRightLegMesh":
                if z >= 0.55:
                    t = smoothstep(0.55, 0.80, z)
                    w["UpperLeg_R"] = 1.0 - (t * 0.2)
                    w["Hips"] = t * 0.2
                elif z >= 0.38:
                    t = smoothstep(0.38, 0.55, z)
                    w["UpperLeg_R"] = t
                    w["LowerLeg_R"] = 1.0 - t
                elif z >= 0.18:
                    t = smoothstep(0.18, 0.38, z)
                    w["LowerLeg_R"] = t
                    w["Foot_R"] = 1.0 - t
                else:
                    w["Foot_R"] = 1.0

            elif region == "HeroWaistMesh":
                # Pelvis, belt, buckle, Chong Kben breeches
                if z >= 0.85:
                    t = smoothstep(0.85, 1.05, z)
                    w["Hips"] = 1.0 - (t * 0.4)
                    w["Spine"] = t * 0.4
                elif z >= 0.65:
                    w["Hips"] = 0.8
                    if x < -0.05:
                        w["UpperLeg_L"] = 0.2
                    elif x > 0.05:
                        w["UpperLeg_R"] = 0.2
                    else:
                        w["Hips"] = 1.0
                else:
                    w["Hips"] = 0.6
                    if x < -0.04:
                        w["UpperLeg_L"] = 0.4
                    elif x > 0.04:
                        w["UpperLeg_R"] = 0.4
                    else:
                        w["Hips"] = 1.0

            elif region == "HeroChestMesh":
                # Tunic, straps, shoulders, satchel
                if z >= 1.40:
                    t = smoothstep(1.40, 1.60, z)
                    w["Chest"] = 1.0
                elif z >= 1.15:
                    t = smoothstep(1.15, 1.40, z)
                    w["Chest"] = t
                    w["Spine"] = 1.0 - t
                else:
                    t = smoothstep(0.95, 1.15, z)
                    w["Spine"] = t
                    w["Hips"] = 1.0 - t

            else:
                w["Hips"] = 1.0

            # Normalize and apply
            tot = sum(w.values())
            if tot > 0:
                for b_name, weight in w.items():
                    if weight > 0.001:
                        vg[b_name].add([idx], weight / tot, 'REPLACE')

    print("Per-part vertex weights assigned cleanly.")

    # 4. Join meshes into a single SkinnedMesh
    bpy.ops.object.select_all(action='DESELECT')
    for o in mesh_objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = mesh_objs[0]
    bpy.ops.object.join()

    hero_mesh = bpy.context.active_object
    hero_mesh.name = "KhmerStudentHero_Skinned"
    print("Unified mesh vertices:", len(hero_mesh.data.vertices), "Materials:", len(hero_mesh.data.materials))

    # 5. Attach Armature Modifier
    hero_mesh.parent = arm_obj
    mod = hero_mesh.modifiers.new(name="Armature", type='ARMATURE')
    mod.object = arm_obj
    mod.use_vertex_groups = True

    # 6. Setup Pose Bones & Rest State
    hero_mesh.select_set(False)
    arm_obj.select_set(True)
    bpy.context.view_layer.objects.active = arm_obj
    bpy.ops.object.mode_set(mode='POSE')

    pose_bones = arm_obj.pose.bones
    for pb in pose_bones:
        pb.rotation_mode = 'XYZ'
        pb.rotation_euler = Euler((0, 0, 0))
        pb.location = Vector((0, 0, 0))
        pb.scale = Vector((1, 1, 1))

    bpy.ops.object.mode_set(mode='OBJECT')

    # 7. Export Skinned GLB in Rest Pose
    bpy.ops.object.select_all(action='DESELECT')
    arm_obj.select_set(True)
    hero_mesh.select_set(True)
    bpy.context.view_layer.objects.active = arm_obj

    print("Exporting rigged GLB to:", OUTPUT_SKINNED_GLB)
    os.makedirs(os.path.dirname(OUTPUT_SKINNED_GLB), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=OUTPUT_SKINNED_GLB,
        use_selection=True,
        export_format='GLB',
        export_apply=False,
        export_skins=True,
        export_materials='EXPORT',
        export_yup=True,
    )

    # Copy to runtime location
    shutil.copyfile(OUTPUT_SKINNED_GLB, OUTPUT_RUNTIME_GLB)
    print("Updated runtime asset:", OUTPUT_RUNTIME_GLB)

    # 8. Studio Camera & Lights Setup for Render Verification
    cam_data = bpy.data.cameras.new("StudioCam")
    cam_obj = bpy.data.objects.new("StudioCam", cam_data)
    bpy.context.collection.objects.link(cam_obj)
    # Full character in frame (Z=0 to Z=2.35): position camera at Y = -4.8, Z = 1.2
    cam_obj.location = Vector((1.8, -4.6, 1.25))
    cam_obj.rotation_euler = Euler((math.radians(88), 0, math.radians(22)))
    scene.camera = cam_obj

    # Key light
    key_data = bpy.data.lights.new("KeySun", type='SUN')
    key_data.energy = 4.0
    key_obj = bpy.data.objects.new("KeySun", key_data)
    bpy.context.collection.objects.link(key_obj)
    key_obj.rotation_euler = Euler((math.radians(50), math.radians(15), math.radians(25)))

    # Fill light
    fill_data = bpy.data.lights.new("FillSun", type='SUN')
    fill_data.energy = 2.2
    fill_obj = bpy.data.objects.new("FillSun", fill_data)
    bpy.context.collection.objects.link(fill_obj)
    fill_obj.rotation_euler = Euler((math.radians(45), math.radians(-25), math.radians(-110)))

    # Back / rim light
    rim_data = bpy.data.lights.new("RimSun", type='SUN')
    rim_data.energy = 3.0
    rim_obj = bpy.data.objects.new("RimSun", rim_data)
    bpy.context.collection.objects.link(rim_obj)
    rim_obj.rotation_euler = Euler((math.radians(-40), math.radians(20), math.radians(170)))

    scene.render.image_settings.file_format = 'PNG'
    scene.render.resolution_x = 1024
    scene.render.resolution_y = 1024

    # 8a. Render Rest Pose
    scene.render.filepath = OUTPUT_PREVIEW_REST
    print("Rendering Rest Pose preview to:", OUTPUT_PREVIEW_REST)
    bpy.ops.render.render(write_still=True)

    # 8b. Render Animated Stride Pose (knee bending, elbow swing, cape flutter)
    bpy.ops.object.mode_set(mode='POSE')
    pose_bones["UpperArm_L"].rotation_euler = Euler((math.radians(-25), 0, 0))
    pose_bones["Forearm_L"].rotation_euler = Euler((math.radians(-32), 0, 0)) # natural elbow bend!
    pose_bones["UpperArm_R"].rotation_euler = Euler((math.radians(28), 0, 0))
    pose_bones["Forearm_R"].rotation_euler = Euler((math.radians(-18), 0, 0))
    pose_bones["UpperLeg_L"].rotation_euler = Euler((math.radians(26), 0, 0))
    pose_bones["LowerLeg_L"].rotation_euler = Euler((math.radians(32), 0, 0)) # natural knee bend!
    pose_bones["UpperLeg_R"].rotation_euler = Euler((math.radians(-22), 0, 0))
    pose_bones["LowerLeg_R"].rotation_euler = Euler((math.radians(10), 0, 0))
    pose_bones["Cape_01"].rotation_euler = Euler((math.radians(-14), 0, 0))
    pose_bones["Cape_02"].rotation_euler = Euler((math.radians(-22), 0, 0))
    pose_bones["Spine"].rotation_euler = Euler((0, math.radians(-4), math.radians(3)))
    bpy.ops.object.mode_set(mode='OBJECT')

    scene.render.filepath = OUTPUT_PREVIEW_POSE
    print("Rendering Kinematic Stride Pose preview to:", OUTPUT_PREVIEW_POSE)
    bpy.ops.render.render(write_still=True)

    print("Rigging & double preview renders completed successfully!")

if __name__ == "__main__":
    run_rigging()

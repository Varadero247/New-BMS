// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
#!/usr/bin/env node
/**
 * Generate 8 Safe Working Procedure (SWP) templates
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const templates = [
  {
    outputPath: 'docs/compliance-templates/procedures/SWP-001-Working-At-Height.docx',
    docNumber: 'SWP-001',
    title: 'Safe Working Procedure — Working at Height',
    version: '1.0',
    owner: '[H&S Manager]',
    approvedBy: '[Operations Director]',
    isoRef: 'ISO 45001:2018 Clause 8.1.2',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'To establish safe working practices for all activities involving work at height, ensuring compliance with the Work at Height Regulations 2005 and ISO 45001:2018. This procedure minimises the risk of falls from height, which remain one of the leading causes of workplace fatalities.',
      },
      {
        heading: '2. Scope',
        content:
          'This procedure applies to all employees, contractors, and visitors who may work at height or access areas where there is a risk of falling 2 metres or more. It covers use of ladders, scaffolding, mobile elevated work platforms (MEWPs), roof access, and any temporary working platform.',
      },
      {
        heading: '3. Definitions',
        bullets: [
          'Work at Height: Any work where a person could fall a distance liable to cause personal injury, including working above, at, or below ground level',
          'MEWP: Mobile Elevated Work Platform (cherry picker, scissor lift)',
          'Fall Arrest System: Personal protective equipment designed to arrest a fall (harness, lanyard, anchor)',
          'Edge Protection: Guardrails, toe boards, and barriers preventing falls from edges',
          'Rescue Plan: Pre-planned procedure for rescuing a person who has fallen and is suspended in a harness',
        ],
      },
      {
        heading: '4. Hazards & Risks',
        content: 'The following hazards have been identified:',
        bullets: [
          'Falls from height — fractures, head injuries, fatalities',
          'Falling objects — injuries to persons below',
          'Structural collapse of working platforms — multiple casualties',
          'Overreaching/overbalancing on ladders — falls',
          'Weather conditions (wind, rain, ice) — increased slip/fall risk',
          'Electrical contact — overhead power lines near MEWPs',
          'Suspension trauma — following arrested fall in harness',
        ],
      },
      { heading: '5. Control Measures', level: 1, content: '' },
      {
        heading: '5.1 Hierarchy of Control',
        level: 2,
        content:
          'Apply the hierarchy:\n\na) AVOID work at height where reasonably practicable\nb) PREVENT falls using edge protection, guardrails, scaffolding\nc) MINIMISE fall distance and consequences using fall arrest, safety nets\nd) Use collective measures (scaffolding, nets) before personal measures (harnesses)',
      },
      {
        heading: '5.2 Pre-Work Requirements',
        level: 2,
        bullets: [
          'Complete a Working at Height Risk Assessment (FRM-002) before any work at height',
          'Obtain a Permit to Work (FRM-006) for work above 4 metres or on fragile surfaces',
          'Verify all personnel hold valid Working at Height training (within 3 years)',
          'Check weather forecast — suspend work if wind speed exceeds 23 mph (37 km/h)',
          'Establish exclusion zone below work area — minimum 2m radius from edges',
          'Brief all workers on the specific Rescue Plan before work commences',
        ],
      },
      {
        heading: '5.3 Equipment Requirements',
        level: 2,
        content: 'All equipment must be inspected before each use:',
        table: {
          headers: ['Equipment', 'Inspection Frequency', 'Inspector', 'Record'],
          rows: [
            ['Ladders', 'Before each use + monthly', 'Competent person', 'Ladder inspection tag'],
            [
              'Scaffolding',
              'Before first use + weekly + after adverse weather',
              'Scaffold inspector (CISRS)',
              'Scaffold register',
            ],
            [
              'MEWPs',
              'Daily pre-use check + 6-monthly LOLER',
              'Operator + competent person',
              'MEWP log book',
            ],
            [
              'Harnesses',
              'Before each use + 6-monthly detailed',
              'Competent person',
              'Harness inspection register',
            ],
            [
              'Lanyards/SRLs',
              'Before each use + 6-monthly detailed',
              'Competent person',
              'PPE register',
            ],
            ['Safety nets', 'Weekly + after any impact', 'Competent person', 'Net inspection log'],
          ],
        },
      },
      {
        heading: '5.4 During Work',
        level: 2,
        bullets: [
          'Never work alone at height — maintain visual/verbal contact with ground person',
          'Maintain 3 points of contact on ladders at all times',
          'Secure all tools and materials to prevent falling objects — use tool lanyards',
          'Do not overload working platforms beyond their rated capacity',
          'Report any defects in equipment immediately — tag out and remove from service',
          'Do not work at height under the influence of alcohol, drugs, or medication causing drowsiness',
        ],
      },
      {
        heading: '6. Emergency & Rescue Procedures',
        content:
          'A documented Rescue Plan must be in place before any work at height begins.\n\na) Suspension trauma can occur within 15 minutes — rescue must be achievable within this timeframe\nb) Designated rescue equipment must be available on site (rescue kit, descent device)\nc) At least 2 persons trained in the rescue procedure must be present\nd) Call emergency services immediately for any fall resulting in injury\ne) Preserve the scene for investigation — do not move equipment unless necessary for rescue',
      },
      {
        heading: '7. Training Requirements',
        bullets: [
          'Working at Height Awareness — all employees who may work at height (refresher every 3 years)',
          'Ladder Safety — all ladder users',
          'Scaffold User/Inspector — as applicable (CISRS card)',
          'MEWP Operator — IPAF certified for each category of MEWP used',
          'Harness Use & Inspection — all users of fall arrest equipment',
          'Rescue from Height — designated rescue team members',
        ],
      },
      {
        heading: '8. Monitoring & Review',
        content:
          'This procedure shall be reviewed annually or following any incident involving a fall from height. The H&S Manager shall conduct periodic inspections of work at height activities and maintain records of compliance.',
      },
      {
        heading: '9. Related Documents',
        bullets: [
          'FRM-002: Hazard & Risk Assessment Form',
          'FRM-006: Permit to Work Form',
          'REG-001: Risk Register',
          'PRO-005: HIRA Procedure',
          'Work at Height Regulations 2005',
          'LOLER 1998',
          'PUWER 1998',
        ],
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/procedures/SWP-002-Confined-Space-Entry.docx',
    docNumber: 'SWP-002',
    title: 'Safe Working Procedure — Confined Space Entry',
    version: '1.0',
    owner: '[H&S Manager]',
    approvedBy: '[Operations Director]',
    isoRef: 'ISO 45001:2018 Clause 8.1.2',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'To establish safe systems of work for entry into and work within confined spaces, ensuring compliance with the Confined Spaces Regulations 1997 and ISO 45001:2018.',
      },
      {
        heading: '2. Scope',
        content:
          'Applies to all confined space entries including tanks, vessels, pits, silos, chambers, ducts, sewers, excavations deeper than 1.2m, and any enclosed or partially enclosed space with limited access/egress where a specified risk exists.',
      },
      {
        heading: '3. Definitions',
        bullets: [
          'Confined Space: Any place which is substantially enclosed and where a specified risk of serious injury exists from hazardous substances, lack of oxygen, engulfment, or entrapment',
          'Specified Risk: Risk of fire/explosion, loss of consciousness from gas/fumes/vapour, drowning, asphyxiation from free-flowing solid, entrapment preventing escape',
          'Entry Supervisor: Competent person responsible for authorising and managing the confined space entry',
          'Entrant: Person who physically enters the confined space',
          'Attendant (Top Person): Person stationed outside to maintain communication and initiate emergency response',
        ],
      },
      {
        heading: '4. Hazards',
        bullets: [
          'Toxic atmosphere (H₂S, CO, methane, solvent vapours)',
          'Oxygen deficiency (<19.5%) or enrichment (>23.5%)',
          'Flammable/explosive atmospheres',
          'Engulfment by liquids, slurry, or free-flowing solids',
          'Entrapment by converging walls or equipment',
          'Electrocution from equipment within the space',
          'Thermal hazards — extreme heat or cold',
        ],
      },
      { heading: '5. Procedure', level: 1, content: '' },
      {
        heading: '5.1 Avoidance',
        level: 2,
        content:
          'Before any confined space entry, assess whether the work can be completed without entry (e.g., remote inspection cameras, long-handled tools, external cleaning methods). Entry is only permitted when no reasonably practicable alternative exists.',
      },
      {
        heading: '5.2 Pre-Entry Requirements',
        level: 2,
        bullets: [
          'Obtain a Confined Space Entry Permit (FRM-006 with confined space addendum)',
          'Conduct atmospheric testing: O₂ (19.5-23.5%), LEL (<10%), H₂S (<10ppm), CO (<25ppm)',
          'Isolate all energy sources — lock out/tag out (LOTO) all mechanical, electrical, pneumatic, hydraulic',
          'Isolate all pipework — blank/disconnect or double-block-and-bleed',
          'Purge/ventilate the space — continuous forced ventilation during entry',
          'Confirm rescue plan and equipment are in place before any entry',
          'Assign Entry Supervisor, Entrant(s), and Attendant — minimum 3 persons',
        ],
      },
      {
        heading: '5.3 During Entry',
        level: 2,
        bullets: [
          'Continuous atmospheric monitoring throughout the entry',
          'Attendant maintains constant visual/verbal contact — never leaves the entry point',
          'Entrant wears full-body harness with retrieval line (where practicable)',
          'Communication check every 5 minutes minimum',
          'EVACUATE IMMEDIATELY if: atmosphere alarm sounds, ventilation fails, entrant feels unwell, any emergency',
        ],
      },
      {
        heading: '5.4 Emergency Rescue',
        level: 2,
        content:
          'NEVER enter a confined space to rescue a casualty without breathing apparatus and a trained rescue team.\n\na) Attendant raises alarm immediately — calls emergency services (999)\nb) Attempt non-entry rescue first (retrieval line/winch)\nc) Entry rescue only by trained rescue team wearing SCBA\nd) Administer first aid once the casualty is removed to fresh air\ne) All casualties to be assessed at hospital even if apparently uninjured',
      },
      {
        heading: '6. Equipment Checklist',
        table: {
          headers: ['Equipment', 'Purpose', 'Check'],
          rows: [
            [
              '4-gas monitor',
              'Continuous atmospheric monitoring',
              'Calibrated within 6 months, bump tested',
            ],
            [
              'Forced ventilation fan',
              'Maintain breathable atmosphere',
              'Operational check, correct ducting',
            ],
            [
              'Full-body harness + tripod/winch',
              'Fall prevention + rescue retrieval',
              'Inspected, rated for entrant weight',
            ],
            ['SCBA sets (x2 minimum)', 'Emergency rescue entry', 'Full cylinders, face-fit tested'],
            ['Communication equipment', 'Entrant-attendant contact', 'Tested before entry'],
            ['Intrinsically safe lighting', 'Illumination in space', 'IS rated, battery charged'],
          ],
        },
      },
      {
        heading: '7. Training',
        bullets: [
          'Confined Space Awareness — all relevant employees',
          'Confined Space Entrant — practical entry procedures',
          'Entry Supervisor — permit management, atmospheric monitoring',
          'Confined Space Rescue — rescue team (annual refresher)',
          'Gas Monitor Use — all entrants and attendants',
        ],
      },
      {
        heading: '8. Related Documents',
        bullets: [
          'FRM-006: Permit to Work Form',
          'PRO-005: HIRA Procedure',
          'Confined Spaces Regulations 1997',
          'Approved Code of Practice L101',
        ],
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/procedures/SWP-003-Hot-Work.docx',
    docNumber: 'SWP-003',
    title: 'Safe Working Procedure — Hot Work',
    version: '1.0',
    owner: '[H&S Manager]',
    approvedBy: '[Operations Director]',
    isoRef: 'ISO 45001:2018 Clause 8.1.2',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'To control the fire and explosion risks associated with hot work activities including welding, cutting, brazing, soldering, grinding, and any operation producing sparks, flames, or heat.',
      },
      {
        heading: '2. Scope',
        content:
          'Applies to all hot work operations conducted on [COMPANY NAME] premises or by [COMPANY NAME] employees at external sites. Includes oxy-fuel cutting/welding, electric arc welding (MIG, TIG, MMA), plasma cutting, brazing/soldering, grinding/cutting with abrasive wheels, and use of heat guns or open flames.',
      },
      {
        heading: '3. Hazards',
        bullets: [
          'Fire from sparks/molten metal contacting combustible materials',
          'Explosion in areas with flammable gases/vapours/dusts',
          'Burns to operator and nearby persons',
          'Toxic fumes (zinc, cadmium, manganese, chromium from coated/stainless steels)',
          'UV/IR radiation — arc eye, skin burns',
          'Electrocution from welding equipment',
          'Noise — grinding and plasma cutting exceed 85 dB(A)',
        ],
      },
      {
        heading: '4. Pre-Work Controls',
        bullets: [
          'Obtain a Hot Work Permit (FRM-006 with hot work addendum) — valid for single shift only',
          'Clear all combustible materials within 11 metres (35 feet) of the work area',
          'Where combustibles cannot be removed, protect with fire-resistant blankets/screens',
          'Check for flammable atmospheres — gas test if near tanks, pipes, or drains',
          'Ensure fire extinguisher (minimum 9L water + CO₂) is within 3 metres of work',
          'Designate a Fire Watch — trained person with extinguisher for duration of work + 60 minutes after',
          'Notify the fire alarm monitoring point to prevent false alarm callouts',
          'Cover/seal floor drains, gaps, and openings where sparks could travel',
        ],
      },
      {
        heading: '5. During Work',
        bullets: [
          'Operator to wear appropriate PPE: auto-darkening welding helmet (shade 10-13), fire-resistant coveralls, welding gauntlets, safety boots, ear protection where required',
          'Use welding screens/curtains to protect bystanders from UV radiation',
          'Ensure adequate ventilation — LEV for indoor welding, RPE if LEV insufficient',
          'Regularly inspect hoses, regulators, cables, and connections',
          'Flashback arrestors fitted to all oxy-fuel equipment',
          'Cylinders stored upright, secured, away from heat sources, with caps when not in use',
        ],
      },
      {
        heading: '6. Post-Work Fire Watch',
        content:
          'The Fire Watch must remain for a minimum of 60 minutes after all hot work ceases. During this period:\n\na) Continuously patrol the work area and adjacent areas (including floors above/below)\nb) Check for smouldering materials, hot spots, and smoke\nc) Maintain access to fire extinguisher and communication device\nd) If any sign of fire is detected — raise the alarm, evacuate, and call the fire brigade',
      },
      {
        heading: '7. Training Requirements',
        bullets: [
          'Hot Work Safety Awareness',
          'Specific welding process certification (e.g., BS EN ISO 9606)',
          'Fire extinguisher use',
          'Fire Watch duties',
        ],
      },
      {
        heading: '8. Related Documents',
        bullets: [
          'FRM-006: Permit to Work Form',
          'PRO-011: Emergency Preparedness',
          'Fire Risk Assessment',
          'COSHH Assessments for welding fumes',
        ],
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/procedures/SWP-004-Electrical-Safety.docx',
    docNumber: 'SWP-004',
    title: 'Safe Working Procedure — Electrical Safety',
    version: '1.0',
    owner: '[H&S Manager]',
    approvedBy: '[Operations Director]',
    isoRef: 'ISO 45001:2018 Clause 8.1.2',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'To prevent electrical injuries (shock, burns, arc flash) and ensure safe isolation of electrical systems during maintenance and repair work, in compliance with the Electricity at Work Regulations 1989.',
      },
      {
        heading: '2. Scope',
        content:
          'Applies to all work on or near electrical systems including low voltage (LV up to 1000V AC), high voltage (HV above 1000V AC), portable appliances, fixed installations, and temporary electrical supplies.',
      },
      {
        heading: '3. Hazards',
        bullets: [
          'Electric shock — ventricular fibrillation, cardiac arrest at currents as low as 30mA',
          'Arc flash — temperatures up to 35,000°F, blast pressure wave, molten metal',
          'Burns — contact burns, arc burns, flash burns',
          'Fire — from overloaded circuits, short circuits, poor connections',
          'Secondary injuries — falls from height following electric shock',
        ],
      },
      {
        heading: '4. Safe Isolation Procedure',
        content:
          'All electrical work requires safe isolation (dead working) unless live working is specifically authorised by the Authorised Person.\n\n1. Identify the circuit/equipment to be isolated\n2. Notify all affected persons\n3. Switch off at the nearest point of isolation\n4. Isolate at the main isolation point (circuit breaker/isolator)\n5. Lock off with personal safety lock — each person applies their own lock\n6. Attach danger tags with name, date, and purpose\n7. PROVE DEAD using a voltage indicator (GS38 compliant)\n8. Test the voltage indicator on a known live source (prove-test-prove method)\n9. Apply earthing where required (HV systems)',
      },
      {
        heading: '5. Competence Requirements',
        table: {
          headers: ['Role', 'Authorisation', 'Activities Permitted'],
          rows: [
            [
              'Authorised Person (AP)',
              'Appointed in writing by duty holder',
              'Issue safety documents, authorise work, HV switching',
            ],
            [
              'Competent Person (CP)',
              'Demonstrated competence, appointed by AP',
              'LV work, testing, safe isolation, fault finding',
            ],
            [
              'Skilled Person (Accompanied)',
              'Under direct supervision of CP',
              'Specific tasks under direct supervision',
            ],
            [
              'PAT Tester',
              'PAT testing training',
              'Portable appliance visual/combined inspection and testing',
            ],
          ],
        },
      },
      {
        heading: '6. Portable Appliance Management',
        bullets: [
          'All portable appliances registered on the PAT register',
          'Visual inspection by user before each use',
          'Combined inspection and test at intervals determined by risk assessment',
          'Defective appliances — remove from service, tag as defective, report to maintenance',
          '110V CTE (Centre Tapped Earth) supply for all portable tools on construction sites',
        ],
      },
      {
        heading: '7. Emergency Response',
        content:
          'In the event of an electrical incident:\n\na) DO NOT touch the casualty if they are still in contact with the electrical source\nb) Isolate the supply if safe to do so — switch off, disconnect, or use a non-conducting implement\nc) Call emergency services (999) — state "electrical injury"\nd) If the casualty is not breathing, commence CPR — use an AED if available\ne) Treat burns with cool running water — do not apply creams\nf) All electrical injuries require hospital assessment (internal injuries may not be immediately apparent)',
      },
      {
        heading: '8. Related Documents',
        bullets: [
          'Electricity at Work Regulations 1989',
          'HSR25: Memo of Guidance (Electricity at Work)',
          'GS38: Electrical Test Equipment',
          'BS 7671: IET Wiring Regulations',
          'FRM-006: Permit to Work Form',
        ],
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/procedures/SWP-005-Manual-Handling.docx',
    docNumber: 'SWP-005',
    title: 'Safe Working Procedure — Manual Handling',
    version: '1.0',
    owner: '[H&S Manager]',
    approvedBy: '[Operations Director]',
    isoRef: 'ISO 45001:2018 Clause 8.1.2',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'To reduce the risk of musculoskeletal disorders (MSDs) from manual handling operations, in compliance with the Manual Handling Operations Regulations 1992 (as amended) and ISO 45001:2018.',
      },
      {
        heading: '2. Scope',
        content:
          'Applies to all manual handling operations: lifting, lowering, pushing, pulling, carrying, holding, and restraining any load (including persons). Covers all employees and contractors.',
      },
      {
        heading: '3. Risk Assessment — TILE Framework',
        content: 'All manual handling tasks shall be assessed using the TILE framework:',
        table: {
          headers: ['Factor', 'Considerations', 'Control Examples'],
          rows: [
            [
              'Task',
              'Distance carried, height of lift, frequency, duration, twisting, stooping',
              'Reduce carry distance, avoid lifting from floor level, rotate tasks',
            ],
            [
              'Individual',
              'Fitness, strength, existing injuries, pregnancy, training',
              'Health surveillance, task rotation, training in techniques',
            ],
            [
              'Load',
              'Weight, size, shape, grip, stability, temperature',
              'Reduce load weight, provide handles, break into smaller loads',
            ],
            [
              'Environment',
              'Space, floor surface, lighting, temperature, slopes',
              'Improve housekeeping, ensure adequate lighting, level surfaces',
            ],
          ],
        },
      },
      {
        heading: '4. Guideline Weights',
        content:
          'HSE guideline weights for lifting and lowering (reduce by factors for twisting, one-handed, team lifts):',
        table: {
          headers: ['Height Zone', 'Close to Body (M/F)', 'Arms Extended (M/F)'],
          rows: [
            ['Shoulder height', '10kg / 7kg', '5kg / 3kg'],
            ['Elbow height', '20kg / 13kg', '10kg / 7kg'],
            ['Knuckle height', '25kg / 16kg', '15kg / 10kg'],
            ['Mid lower leg', '10kg / 7kg', '5kg / 3kg'],
          ],
        },
      },
      {
        heading: '5. Safe Lifting Technique',
        bullets: [
          'Plan the lift — assess the load, route, and destination',
          'Position feet hip-width apart with one foot slightly forward',
          'Bend knees, keep back straight, grip the load firmly',
          'Lift smoothly using leg muscles — avoid jerking',
          'Keep the load close to the body, arms below shoulder height',
          'Avoid twisting — turn using feet, not the spine',
          'Set down by reversing the procedure — bend knees, controlled lowering',
        ],
      },
      {
        heading: '6. Mechanical Aids',
        content: 'Where manual handling cannot be avoided, provide mechanical aids:',
        bullets: [
          'Pallet trucks and trolleys for horizontal movement',
          'Hoists and cranes for heavy/awkward loads',
          'Vacuum lifters for sheet materials',
          'Conveyor systems for repetitive movements',
          'Height-adjustable workstations to reduce stooping/reaching',
        ],
      },
      {
        heading: '7. Training',
        content:
          'All employees involved in manual handling shall receive:\n\na) Manual Handling Awareness training on induction\nb) Task-specific manual handling assessment for their role\nc) Refresher training every 3 years or following any MSD report\nd) Practical sessions covering correct lifting techniques',
      },
      {
        heading: '8. Related Documents',
        bullets: [
          'FRM-002: Hazard & Risk Assessment Form',
          'Manual Handling Operations Regulations 1992',
          'HSE INDG143: Manual Handling at Work',
          'Occupational Health Referral Process',
        ],
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/procedures/SWP-006-COSHH.docx',
    docNumber: 'SWP-006',
    title: 'Safe Working Procedure — COSHH (Hazardous Substances)',
    version: '1.0',
    owner: '[H&S Manager]',
    approvedBy: '[Operations Director]',
    isoRef: 'ISO 45001:2018 Clause 8.1.2 / ISO 14001:2015 Clause 8.1',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'To control exposure to hazardous substances in the workplace, preventing ill health in compliance with the Control of Substances Hazardous to Health Regulations 2002 (as amended), ISO 45001:2018, and ISO 14001:2015.',
      },
      {
        heading: '2. Scope',
        content:
          'Covers all substances hazardous to health including chemicals, fumes, dusts, vapours, mists, gases, biological agents, and any substance with a Workplace Exposure Limit (WEL). Applies to purchased chemicals, process-generated substances, and naturally occurring hazards (e.g., silica dust, wood dust).',
      },
      {
        heading: '3. COSHH Assessment Process',
        bullets: [
          'Identify all hazardous substances used/generated in each work area',
          'Obtain and review Safety Data Sheets (SDS) for all substances',
          'Assess exposure — who is exposed, how, how much, how often',
          'Determine control measures using the hierarchy of control',
          'Record the assessment and communicate findings to affected persons',
          'Review assessments annually or when substances/processes change',
        ],
      },
      {
        heading: '4. Hierarchy of Control',
        content:
          '1. ELIMINATE — substitute with a non-hazardous or less hazardous substance\n2. SUBSTITUTE — use a safer form (e.g., pellets instead of powder to reduce dust)\n3. ENCLOSE — totally enclosed process (glove boxes, sealed systems)\n4. LOCAL EXHAUST VENTILATION (LEV) — extract at source\n5. GENERAL VENTILATION — dilute contaminant concentration\n6. SAFE SYSTEMS OF WORK — reduce exposure time, housekeeping procedures\n7. PPE — last resort, RPE must be face-fit tested, appropriate to the hazard',
      },
      {
        heading: '5. Storage Requirements',
        bullets: [
          'Store in designated, ventilated chemical storage areas',
          'Segregate incompatible chemicals (acids from alkalis, oxidisers from flammables)',
          'Flammable liquids in fire-resistant cabinets (>50 litres)',
          'All containers labelled with GHS/CLP pictograms and hazard statements',
          'Spill containment bunds capable of holding 110% of the largest container',
          'COSHH cupboard/store inventory maintained and checked monthly',
        ],
      },
      {
        heading: '6. Health Surveillance',
        content:
          'Where COSHH assessment identifies a risk of adverse health effects, health surveillance shall be provided:\n\n• Respiratory function tests for workers exposed to respiratory sensitisers\n• Skin checks for workers exposed to dermatitis-causing substances\n• Biological monitoring where applicable (e.g., blood lead levels)\n• Records retained for 40 years',
      },
      {
        heading: '7. Emergency Procedures',
        content:
          'Chemical spill response:\n\na) Evacuate the immediate area — prevent others from entering\nb) Consult the SDS for specific spillage instructions\nc) Use the appropriate spill kit (acid, alkali, solvent, or universal)\nd) Wear correct PPE as specified in the COSHH assessment\ne) Contain the spill — prevent entry into drains or watercourses\nf) Dispose of contaminated materials as hazardous waste\ng) Report the spill to the H&S Manager and Environmental Manager',
      },
      {
        heading: '8. Related Documents',
        bullets: [
          'COSHH Regulations 2002',
          'EH40/2005: Workplace Exposure Limits',
          'Safety Data Sheet Library',
          'FRM-010: Environmental Aspects Register',
          'PRO-006: Environmental Aspects & Impacts',
        ],
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/procedures/SWP-007-Lone-Working.docx',
    docNumber: 'SWP-007',
    title: 'Safe Working Procedure — Lone Working',
    version: '1.0',
    owner: '[H&S Manager]',
    approvedBy: '[Operations Director]',
    isoRef: 'ISO 45001:2018 Clause 8.1.2',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'To ensure the health and safety of employees who work alone or in isolated locations, whether on company premises, at client sites, or while travelling.',
      },
      {
        heading: '2. Scope',
        content:
          'Applies to all situations where an employee works without direct supervision or close proximity to colleagues, including: out-of-hours work on premises, field service/maintenance engineers, home workers, security personnel, cleaning staff, delivery drivers, and anyone travelling alone for work.',
      },
      {
        heading: '3. Risk Assessment',
        content:
          'Before authorising lone working, the line manager must assess:\n\na) Can the work be done safely by one person?\nb) Are there specific hazards that require a second person (e.g., work at height, confined space)?\nc) Is the worker medically fit for lone working? (Consider pre-existing conditions)\nd) Is the work environment safe? (Remote location, public-facing, high-risk area)\ne) Can the worker summon help in an emergency?\nf) Is there a risk of violence or aggression?',
      },
      {
        heading: '4. Control Measures',
        bullets: [
          'Establish a check-in/check-out system — worker reports start time, location, expected finish',
          'Scheduled welfare checks at agreed intervals (maximum 2 hours for higher-risk activities)',
          'Lone worker alarm device (personal safety alarm or lone worker app with GPS and man-down)',
          'Mobile phone with charged battery and emergency contacts programmed',
          'Define clear escalation procedure if a check-in is missed',
          'Prohibit lone working for high-risk activities: work at height >4m, confined space entry, live electrical work, work near unguarded machinery',
          'Provide appropriate training: conflict de-escalation for public-facing roles, first aid, emergency procedures',
        ],
      },
      {
        heading: '5. Escalation Procedure',
        content:
          "If a lone worker fails to check in at the scheduled time:\n\n1. Attempt to contact the worker by phone/radio (3 attempts over 15 minutes)\n2. If no response — contact the worker's emergency contact and line manager\n3. If still no response within 30 minutes — dispatch a colleague to the worker's last known location\n4. If the worker cannot be located — contact emergency services (999)\n5. Notify senior management and record the incident",
      },
      {
        heading: '6. Prohibited Activities',
        content: 'The following activities must NEVER be undertaken by a lone worker:',
        bullets: [
          'Confined space entry',
          'Work at height above 4 metres',
          'Live electrical work',
          'Work with hazardous substances without specific COSHH lone working assessment',
          'Hot work in isolated locations',
          'Operation of certain dangerous machinery (as specified in risk assessment)',
        ],
      },
      {
        heading: '7. Related Documents',
        bullets: [
          'FRM-002: Hazard & Risk Assessment Form',
          'HSE INDG73: Working Alone',
          'Violence at Work Policy',
          'Mobile Working Policy',
        ],
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/procedures/SWP-008-Excavation-Groundworks.docx',
    docNumber: 'SWP-008',
    title: 'Safe Working Procedure — Excavation & Groundworks',
    version: '1.0',
    owner: '[H&S Manager]',
    approvedBy: '[Operations Director]',
    isoRef: 'ISO 45001:2018 Clause 8.1.2',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'To establish safe systems of work for excavation and groundworks activities, preventing collapse, striking underground services, and falls into excavations.',
      },
      {
        heading: '2. Scope',
        content:
          'Applies to all excavation work including trenching, pits, shafts, tunnelling, foundation excavation, and any disturbance of ground that could affect stability or encounter underground services. Covers hand-dig and machine-dig operations.',
      },
      {
        heading: '3. Hazards',
        bullets: [
          'Collapse of excavation sides — burial and asphyxiation',
          'Striking underground services (gas, electricity, water, telecoms, sewers)',
          'Falls of persons into excavations',
          'Falls of materials/vehicles into excavations',
          'Flooding/water ingress',
          'Hazardous atmosphere in deep excavations',
          'Undermining adjacent structures (buildings, roads, retaining walls)',
        ],
      },
      {
        heading: '4. Pre-Work Requirements',
        bullets: [
          'Obtain Excavation Permit (FRM-006 with excavation addendum)',
          'Commission underground service detection survey (CAT & Genny scan as minimum)',
          'Request utility company records and mark up all known services',
          'Hand-dig trial holes within 500mm of any known or suspected service',
          'Appoint a competent Temporary Works Coordinator if shoring/support required',
          'Assess ground conditions — soil type, water table, adjacent structures, recent weather',
          'Plan spoil storage — minimum 1 metre from excavation edge',
        ],
      },
      {
        heading: '5. Excavation Support',
        content:
          'All excavations deeper than 1.2 metres must be assessed for support requirements:',
        table: {
          headers: ['Method', 'Application', 'Key Requirements'],
          rows: [
            [
              'Battering back',
              'Open areas, stable ground',
              'Slope angle determined by soil type (typically 45° for clay)',
            ],
            ['Timber shoring', 'Trench <6m deep', 'Installed by competent person, inspected daily'],
            [
              'Trench box/sheets',
              'Deeper trenches, unstable ground',
              'Rated for excavation depth, installed before entry',
            ],
            [
              'Sheet piling',
              'Deep excavations near structures',
              'Designed by temporary works engineer',
            ],
            [
              'Benching',
              'Wide excavations in suitable ground',
              'Step height ≤1.5m, bench width ≥600mm',
            ],
          ],
        },
      },
      {
        heading: '6. During Work',
        bullets: [
          'Competent person inspects excavation at start of each shift, after rain, and after any event affecting stability',
          'Edge protection (guardrails + toe boards) on all excavations >2m deep or adjacent to pedestrian/vehicle routes',
          'Safe means of access/egress within 15 metres of any working position (ladders secured at top)',
          'No vehicles or heavy plant within 2 metres of excavation edge unless battered back or adequately supported',
          'Continuous atmospheric monitoring for excavations >3m deep or where contaminated ground suspected',
          'Stop work immediately if any signs of instability, unexpected services, or contamination',
        ],
      },
      {
        heading: '7. Backfill & Reinstatement',
        content:
          'a) Remove all support materials from the bottom up (never all at once)\nb) Compact backfill in layers as specified by the engineer\nc) Reinstate surfaces to original condition\nd) Update as-built drawings with any relocated or newly discovered services\ne) Remove all edge protection only when excavation is fully backfilled',
      },
      {
        heading: '8. Related Documents',
        bullets: [
          'FRM-006: Permit to Work Form',
          'HSG47: Avoiding Danger from Underground Services',
          'BS 6031: Code of Practice for Earthworks',
          'CDM Regulations 2015',
          'PRO-005: HIRA Procedure',
        ],
      },
    ],
  },
];

async function main() {
  const tmpDir = '/tmp/swp-configs';
  fs.mkdirSync(tmpDir, { recursive: true });

  console.log(`Generating ${templates.length} SWP documents...`);
  for (const t of templates) {
    const configPath = path.join(tmpDir, `${t.docNumber}.json`);
    fs.writeFileSync(configPath, JSON.stringify(t, null, 2));
    execSync(`node /home/dyl/New-BMS/scripts/create-docx.mjs ${configPath}`, { stdio: 'inherit' });
  }
  console.log(`\nDone: ${templates.length} SWP documents generated.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

export function getCategoryForCourse(courseName: string): string {
  const name = courseName.toUpperCase();
  if (name.includes('ARCHITECTURE')) return 'Architecture';
  if (name.includes('B-PHARMA')) return 'B.Pharm';
  if (name.includes('PHARMA-D') || name.includes('PHARM-D')) return 'D.Pharm';
  if (name.includes('VETERINARY') || name.includes('VETER SCI') || name.includes('B.V.SC')) return 'Veterinary';
  if (name.includes('NURSING')) return 'B.Sc Nursing';
  if (name.includes('BNYS') || name.includes('NATUROPATHY') || name.includes('YOGA')) return 'BNYS';
  if (name.includes('PHYSIOTHERAPY') || name.includes('BPT')) return 'BPT';
  if (name.includes('PROSTHETICS ORTHOTICS') || name.includes('BPO')) return 'BPO';
  if (name.includes('OPTOMETRY')) return 'BPO';

  // Agriculture and Farm Sciences
  if (
    name.includes('AGRICULTURE') ||
    name.includes('AGRI') ||
    name.includes('FORESTRY') ||
    name.includes('HORTICULTURE') ||
    name.includes('SERICULTURE') ||
    name.includes('FISHERIES') ||
    name.includes('FOOD SCI') ||
    name.includes('DAIRY') ||
    name.includes('NUTRITION') ||
    name.includes('DIETETICS') ||
    name.includes('COMMUNITY SCIENCE') ||
    name.includes('FOOD TECHNOLOGY') ||
    name.includes('FOOD TECH') ||
    name.includes('AG. ') ||
    name.includes('D.TECH')
  ) {
    return 'Agriculture';
  }

  // Allied Health Sciences
  if (
    name.includes('AHS') ||
    name.includes('OPERATION THEATER') ||
    name.includes('OCCUPATIONAL') ||
    name.includes('AUDIOLOGY') ||
    name.includes('ANAEST') ||
    name.includes('CARDIAC') ||
    name.includes('TRAUMA') ||
    name.includes('IMAGING') ||
    name.includes('LAB') ||
    name.includes('NEURO') ||
    name.includes('PERFUSION') ||
    name.includes('RADIOTHERAPY') ||
    name.includes('RENAL') ||
    name.includes('RESP') ||
    name.includes('HOSP. ADMIN') ||
    name.includes('RECORD TECH') ||
    name.includes('PUBLIC HEALTH')
  ) {
    return 'Allied Health Sciences';
  }

  return 'Engineering';
}

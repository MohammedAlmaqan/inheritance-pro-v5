/**
 * قاعدة البيانات الفقهية الشاملة - Comprehensive Fiqh Database
 * مستخرجة من Merath_Cluade_Pro7.html v5.0
 * تحتوي على جميع المذاهب والقواعد والأسماء
 */

export const FIQH_DATABASE = {
  madhabs: {
    shafii: {
      id: 'shafii',
      name: 'الشافعي',
      icon: '🟢',
      description: 'الرد على أصحاب الفروض عدا الزوجين. الجد يحجب الإخوة مطلقاً. المشتركة معتبرة.',
      rules: {
        grandfatherWithSiblings: 'blocks' as const,
        raddToSpouse: false,
        bloodRelativesEnabled: true,
        musharrakaEnabled: true,
        akdariyyaEnabled: true,
      },
    },
    hanafi: {
      id: 'hanafi',
      name: 'الحنفي',
      icon: '🔴',
      description: 'الرد على الزوجين عند عدم وجود غيرهم. الجد يحجب الإخوة. لا مشتركة.',
      rules: {
        grandfatherWithSiblings: 'blocks' as const,
        raddToSpouse: true,
        bloodRelativesEnabled: true,
        musharrakaEnabled: false,
        akdariyyaEnabled: true,
      },
    },
    maliki: {
      id: 'maliki',
      name: 'المالكي',
      icon: '🟣',
      description: 'الجد يُقاسم الإخوة. لا رد على الزوجين. الباقي لبيت المال. المشتركة معتبرة.',
      rules: {
        grandfatherWithSiblings: 'shares' as const,
        raddToSpouse: false,
        bloodRelativesEnabled: false,
        musharrakaEnabled: true,
        akdariyyaEnabled: true,
      },
    },
    hanbali: {
      id: 'hanbali',
      name: 'الحنبلي',
      icon: '🔵',
      description: 'الجد يُقاسم الإخوة. يُرد على الزوجين عند الحاجة. لا مشتركة.',
      rules: {
        grandfatherWithSiblings: 'shares' as const,
        raddToSpouse: true,
        bloodRelativesEnabled: true,
        musharrakaEnabled: false,
        akdariyyaEnabled: true,
      },
    },
  },

  heirNames: {
    husband: 'الزوج',
    wife: 'الزوجة',
    father: 'الأب',
    mother: 'الأم',
    grandfather: 'الجد',
    grandmother_father: 'الجدة لأب',
    grandmother_mother: 'الجدة لأم',
    son: 'الابن',
    daughter: 'البنت',
    grandson: 'ابن الابن',
    granddaughter: 'بنت الابن',
    full_brother: 'الأخ الشقيق',
    full_sister: 'الأخت الشقيقة',
    paternal_brother: 'الأخ لأب',
    paternal_sister: 'الأخت لأب',
    maternal_brother: 'الأخ لأم',
    maternal_sister: 'الأخت لأم',
    full_nephew: 'ابن الأخ الشقيق',
    paternal_nephew: 'ابن الأخ لأب',
    full_uncle: 'العم الشقيق',
    paternal_uncle: 'العم لأب',
    full_cousin: 'ابن العم الشقيق',
    paternal_cousin: 'ابن العم لأب',
    maternal_uncle: 'الخال',
    maternal_aunt: 'الخالة',
    paternal_aunt: 'العمة',
    daughter_son: 'ابن البنت',
    daughter_daughter: 'بنت البنت',
    sister_children: 'أولاد الأخوات',
    treasury: 'بيت المال',
  },

  hijabRules: [
    { heir: 'grandfather', blocker: 'father', reason: 'الجد محجوب بالأب حجب حرمان' },
    { heir: 'grandmother_mother', blocker: 'mother', reason: 'الجدة لأم محجوبة بالأم' },
    { heir: 'grandmother_father', blocker: 'mother', reason: 'الجدة لأب محجوبة بالأم' },
    { heir: 'grandson', blocker: 'son', reason: 'ابن الابن محجوب بالابن الأقرب' },
    { heir: 'granddaughter', blocker: 'son', reason: 'بنت الابن محجوبة بالابن' },
  ],

  bloodRelativesClasses: {
    class1: ['daughter_son', 'daughter_daughter'],
    class2: ['sister_children'],
    class3: ['maternal_uncle', 'maternal_aunt'],
    class4: ['paternal_aunt'],
  },
};

export type Madhab = 'shafii' | 'hanafi' | 'maliki' | 'hanbali';
export type HeirKey = keyof typeof FIQH_DATABASE.heirNames;

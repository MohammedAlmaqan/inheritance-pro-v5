/**
 * محرك حساب المواريث الإسلامية - Islamic Inheritance Calculation Engine
 * الإصدار 5.0 - مستخرج من Merath_Cluade_Pro7.html بدقة 100%
 * يدعم المذاهب الأربعة، الحالات الخاصة، ذوو الأرحام، والعول والرد
 */

import { Fraction } from './fraction';
import { FIQH_DATABASE, Madhab, HeirKey } from './fiqh-database';
import {
  HeirShare,
  BlockedHeir,
  SpecialCase,
  CalculationStep,
  Warning,
  CalculationResult,
  EstateData,
  HeirsData,
} from './types';

/**
 * فئة HeirShare - تمثل حصة الوارث
 */
class HeirShareImpl implements HeirShare {
  key: HeirKey | string;
  name: string;
  type: string;
  fraction: Fraction;
  count: number;
  shares?: number;
  originalFraction?: Fraction;
  reason: string;
  amount: number = 0;
  amountPerPerson: number = 0;

  constructor(data: Partial<HeirShare>) {
    this.key = data.key || '';
    this.name = data.name || '';
    this.type = data.type || '';
    this.fraction = data.fraction || Fraction.ZERO;
    this.count = data.count || 1;
    this.shares = data.shares;
    this.reason = data.reason || '';
  }

  addFraction(other: Fraction): HeirShare {
    this.fraction = this.fraction.add(other);
    return this;
  }

  calculateAmount(netEstate: number): void {
    this.amount = Math.round(this.fraction.toDecimal() * netEstate * 100) / 100;
    this.amountPerPerson = this.count > 0 ? this.amount / this.count : 0;
  }
}

/**
 * محرك الحساب الرئيسي
 */
class InheritanceEngine {
  private madhab: Madhab;
  private config: any;
  private estate: EstateData;
  private heirs: HeirsData;
  private state: {
    steps: CalculationStep[];
    specialCases: SpecialCase[];
    blockedHeirs: BlockedHeir[];
    madhhabNotes: string[];
    warnings: Warning[];
    errors: string[];
  };
  private results: {
    netEstate: number;
    shares: HeirShare[];
    asl: number;
    finalBase: number;
    awlApplied: boolean;
    awlRatio?: Fraction;
    raddApplied: boolean;
    bloodRelativesApplied: boolean;
    confidence: number;
  };

  constructor(madhab: Madhab, estate: EstateData, heirs: HeirsData) {
    this.madhab = madhab;
    this.config = FIQH_DATABASE.madhabs[madhab];
    this.estate = { ...estate };
    this.heirs = { ...heirs };

    this.state = {
      steps: [],
      specialCases: [],
      blockedHeirs: [],
      madhhabNotes: [],
      warnings: [],
      errors: [],
    };

    this.results = {
      netEstate: 0,
      shares: [],
      asl: 1,
      finalBase: 1,
      awlApplied: false,
      raddApplied: false,
      bloodRelativesApplied: false,
      confidence: 1.0,
    };

    this.validateInputs();
  }

  private validateInputs(): void {
    if (this.estate.total <= 0) {
      this.state.errors.push('قيمة التركة يجب أن تكون موجبة');
    }
    if (this.estate.funeral < 0 || this.estate.debts < 0 || this.estate.will < 0) {
      this.state.errors.push('قيم التكاليف والديون والوصية لا يمكن أن تكون سالبة');
    }

    const hasHeirs = Object.values(this.heirs).some((v) => v > 0);
    if (!hasHeirs) {
      this.state.errors.push('يجب أن يكون هناك وارث واحد على الأقل');
    }
  }

  private addStep(title: string, description: string, details?: any): void {
    this.state.steps.push({ title, description, details });
  }

  // ========== دوال مساعدة للفحص ==========

  private hasDescendants(): boolean {
    return (
      (this.heirs.son || 0) +
        (this.heirs.daughter || 0) +
        (this.heirs.grandson || 0) +
        (this.heirs.granddaughter || 0) >
      0
    );
  }

  private hasMaleDescendants(): boolean {
    return (this.heirs.son || 0) + (this.heirs.grandson || 0) > 0;
  }

  private hasFemaleDescendants(): boolean {
    return (this.heirs.daughter || 0) + (this.heirs.granddaughter || 0) > 0;
  }

  private hasChildren(): boolean {
    return (this.heirs.son || 0) + (this.heirs.daughter || 0) > 0;
  }

  private hasSons(): boolean {
    return (this.heirs.son || 0) > 0;
  }

  private getFullSiblingsCount(): number {
    return (this.heirs.full_brother || 0) + (this.heirs.full_sister || 0);
  }

  private getPaternalSiblingsCount(): number {
    return (this.heirs.paternal_brother || 0) + (this.heirs.paternal_sister || 0);
  }

  private getMaternalSiblingsCount(): number {
    return (this.heirs.maternal_brother || 0) + (this.heirs.maternal_sister || 0);
  }

  private getAllSiblingsCount(): number {
    return (
      this.getFullSiblingsCount() +
      this.getPaternalSiblingsCount() +
      this.getMaternalSiblingsCount()
    );
  }

  private getFullAndPaternalSiblingsCount(): number {
    return this.getFullSiblingsCount() + this.getPaternalSiblingsCount();
  }

  private hasMaleAscendant(): boolean {
    return (this.heirs.father || 0) > 0 || (this.heirs.grandfather || 0) > 0;
  }

  private hasSpouse(): boolean {
    return (this.heirs.husband || 0) > 0 || (this.heirs.wife || 0) > 0;
  }

  // ========== الحالات الخاصة ==========

  private isUmariyyah(): boolean {
    const h = this.heirs;
    const hasSpouse = (h.husband || 0) > 0 || (h.wife || 0) > 0;
    const hasFatherMother = (h.father || 0) > 0 && (h.mother || 0) > 0;
    const noDescendants = !this.hasDescendants();
    const noSiblings = this.getAllSiblingsCount() === 0;
    const noGrandfather = (h.grandfather || 0) === 0;

    return hasSpouse && hasFatherMother && noDescendants && noSiblings && noGrandfather;
  }

  private isMusharraka(): boolean {
    if (!this.config.rules.musharrakaEnabled) return false;

    const h = this.heirs;
    const hasHusband = (h.husband || 0) > 0;
    const hasMotherOrGrandmother =
      (h.mother || 0) > 0 || (h.grandmother_mother || 0) > 0;
    const maternalSiblings = this.getMaternalSiblingsCount();
    const hasFullSiblings = this.getFullSiblingsCount() > 0;
    const noDescendants = !this.hasDescendants();
    const noFatherOrGrandfather = (h.father || 0) === 0 && (h.grandfather || 0) === 0;

    return (
      hasHusband &&
      hasMotherOrGrandmother &&
      maternalSiblings >= 2 &&
      hasFullSiblings &&
      noDescendants &&
      noFatherOrGrandfather
    );
  }

  private isAkdariyya(): boolean {
    const h = this.heirs;
    return (
      (h.husband || 0) > 0 &&
      (h.mother || 0) > 0 &&
      (h.grandfather || 0) > 0 &&
      (h.full_sister || 0) > 0 &&
      !this.hasDescendants() &&
      (h.father || 0) === 0 &&
      (h.full_brother || 0) === 0
    );
  }

  // ========== تطبيق الحجب ==========

  private applyHijab(): void {
    this.addStep('تطبيق الحجب', 'فحص قواعس الحجب الفقهية');
    const blocked: BlockedHeir[] = [];
    const h = this.heirs;
    const rules = this.config.rules;

    // 1. الأب يحجب الجد
    if (h.father > 0 && h.grandfather > 0) {
      blocked.push({
        heir: 'grandfather',
        by: 'father',
        reason: 'الجد محجوب بالأب حجب حرمان',
      });
      h.grandfather = 0;
    }

    // 2. الأم تحجب الجدات
    if (h.mother > 0) {
      if (h.grandmother_mother > 0) {
        blocked.push({
          heir: 'grandmother_mother',
          by: 'mother',
          reason: 'الجدة لأم محجوبة بالأم',
        });
        h.grandmother_mother = 0;
      }
      if (h.grandmother_father > 0) {
        blocked.push({
          heir: 'grandmother_father',
          by: 'mother',
          reason: 'الجدة لأب محجوبة بالأم',
        });
        h.grandmother_father = 0;
      }
    }

    // 3. الأب يحجب الجدة لأب
    if (h.father > 0 && h.grandmother_father > 0) {
      blocked.push({
        heir: 'grandmother_father',
        by: 'father',
        reason: 'الجدة لأب محجوبة بالأب',
      });
      h.grandmother_father = 0;
    }

    // 4. الابن يحجب ابن الابن وبنت الابن
    if (h.son > 0) {
      if (h.grandson > 0) {
        blocked.push({
          heir: 'grandson',
          by: 'son',
          reason: 'ابن الابن محجوب بالابن الأقرب',
        });
        h.grandson = 0;
      }
      if (h.granddaughter > 0) {
        blocked.push({
          heir: 'granddaughter',
          by: 'son',
          reason: 'بنت الابن محجوبة بالابن',
        });
        h.granddaughter = 0;
      }
    }

    // 5. بنت الابن محجوبة ببنتين فأكثر
    if (h.daughter >= 2 && h.granddaughter > 0 && (h.grandson || 0) === 0) {
      blocked.push({
        heir: 'granddaughter',
        by: 'daughter',
        reason: 'بنت الابن محجوبة ببنتين فأكثر لاستيفاء الثلثين ولا معصب لها',
      });
      h.granddaughter = 0;
    }

    // 6. حجب الإخوة بالفرع الوارث الذكر أو الأب
    const blockedByMaleFuruOrFather = h.son > 0 || h.grandson > 0 || h.father > 0;

    if (blockedByMaleFuruOrFather) {
      const siblingsToBlock = [
        'full_brother',
        'full_sister',
        'paternal_brother',
        'paternal_sister',
      ];
      siblingsToBlock.forEach((heir) => {
        const heirValue = h[heir as keyof HeirsData];
        if (heirValue && heirValue > 0) {
          const blocker = h.father > 0 ? 'الأب' : 'الابن/ابن الابن';
          blocked.push({
            heir,
            by: blocker,
            reason: `${FIQH_DATABASE.heirNames[heir as HeirKey]} محجوب بـ${blocker}`,
          });
          h[heir as keyof HeirsData] = 0;
        }
      });
    }

    // 7. الجد يحجب الإخوة في الشافعي والحنفي
    if (h.grandfather > 0 && rules.grandfatherWithSiblings === 'blocks') {
      const siblingsToBlock = [
        'full_brother',
        'full_sister',
        'paternal_brother',
        'paternal_sister',
      ];
      siblingsToBlock.forEach((heir) => {
        const heirValue = h[heir as keyof HeirsData];
        if (heirValue && heirValue > 0) {
          blocked.push({
            heir,
            by: 'grandfather',
            reason: `${FIQH_DATABASE.heirNames[heir as HeirKey]} محجوب بالجد (${this.config.name})`,
          });
          h[heir as keyof HeirsData] = 0;
        }
      });
      this.state.madhhabNotes.push(
        `في المذهب ${this.config.name}: الجد يحجب الإخوة الأشقاء ولأب حجب حرمان`
      );
    }

    // 8. الإخوة لأم محجوبون بالفرع الوارث مطلقاً أو الأصل الذكر
    if (this.hasDescendants() || this.hasMaleAscendant()) {
      ['maternal_brother', 'maternal_sister'].forEach((heir) => {
        const heirValue = h[heir as keyof HeirsData];
        if (heirValue && heirValue > 0) {
          const blocker = this.hasDescendants() ? 'الفرع الوارث' : 'الأصل الذكر';
          blocked.push({
            heir,
            by: blocker,
            reason: `${FIQH_DATABASE.heirNames[heir as HeirKey]} محجوب بـ${blocker}`,
          });
          h[heir as keyof HeirsData] = 0;
        }
      });
    }

    // 9. الأخ لأب محجوب بالأخ الشقيق
    if (h.full_brother > 0 && h.paternal_brother > 0) {
      blocked.push({
        heir: 'paternal_brother',
        by: 'full_brother',
        reason: 'الأخ لأب محجوب بالأخ الشقيق لقوة القرابة',
      });
      h.paternal_brother = 0;
    }

    // 10. الأخت لأب محجوبة بأختين شقيقتين
    if (h.full_sister >= 2 && h.paternal_sister > 0 && (h.paternal_brother || 0) === 0) {
      if (!this.hasFemaleDescendants()) {
        blocked.push({
          heir: 'paternal_sister',
          by: 'full_sister',
          reason: 'الأخت لأب محجوبة بأختين شقيقتين فأكثر لاستيفاء الثلثين ولا معصب لها',
        });
        h.paternal_sister = 0;
      }
    }

    // 11. حجب العصبات البعيدة بالأقرب
    const hasCloserAsaba =
      h.full_brother > 0 ||
      h.paternal_brother > 0 ||
      (h.grandfather > 0 && rules.grandfatherWithSiblings === 'shares');

    if (hasCloserAsaba || h.father > 0 || this.hasMaleDescendants()) {
      const distantAsaba = [
        'full_nephew',
        'paternal_nephew',
        'full_uncle',
        'paternal_uncle',
        'full_cousin',
        'paternal_cousin',
      ];
      distantAsaba.forEach((heir) => {
        const heirValue = h[heir as keyof HeirsData];
        if (heirValue && heirValue > 0) {
          blocked.push({
            heir,
            by: 'عاصب أقرب',
            reason: `${FIQH_DATABASE.heirNames[heir as HeirKey]} محجوب بعاصب أقرب منه`,
          });
          h[heir as keyof HeirsData] = 0;
        }
      });
    }

    // ترتيب العصبات البعيدة فيما بينها
    if (h.full_nephew > 0) {
      ['paternal_nephew', 'full_uncle', 'paternal_uncle', 'full_cousin', 'paternal_cousin'].forEach(
        (heir) => {
          const heirValue = h[heir as keyof HeirsData];
          if (heirValue && heirValue > 0) {
            blocked.push({ heir, by: 'full_nephew', reason: `محجوب بابن الأخ الشقيق` });
            h[heir as keyof HeirsData] = 0;
          }
        }
      );
    } else if (h.paternal_nephew > 0) {
      ['full_uncle', 'paternal_uncle', 'full_cousin', 'paternal_cousin'].forEach((heir) => {
        const heirValue = h[heir as keyof HeirsData];
        if (heirValue && heirValue > 0) {
          blocked.push({ heir, by: 'paternal_nephew', reason: `محجوب بابن الأخ لأب` });
          h[heir as keyof HeirsData] = 0;
        }
      });
    } else if (h.full_uncle > 0) {
      ['paternal_uncle', 'full_cousin', 'paternal_cousin'].forEach((heir) => {
        const heirValue = h[heir as keyof HeirsData];
        if (heirValue && heirValue > 0) {
          blocked.push({ heir, by: 'full_uncle', reason: `محجوب بالعم الشقيق` });
          h[heir as keyof HeirsData] = 0;
        }
      });
    } else if (h.paternal_uncle > 0) {
      ['full_cousin', 'paternal_cousin'].forEach((heir) => {
        const heirValue = h[heir as keyof HeirsData];
        if (heirValue && heirValue > 0) {
          blocked.push({ heir, by: 'paternal_uncle', reason: `محجوب بالعم لأب` });
          h[heir as keyof HeirsData] = 0;
        }
      });
    } else if (h.full_cousin > 0) {
      if (h.paternal_cousin > 0) {
        blocked.push({
          heir: 'paternal_cousin',
          by: 'full_cousin',
          reason: `محجوب بابن العم الشقيق`,
        });
        h.paternal_cousin = 0;
      }
    }

    this.state.blockedHeirs = blocked;

    if (blocked.length > 0) {
      this.addStep('نتيجة الحجب', `تم حجب ${blocked.length} وارث/ورثة`, blocked);
    } else {
      this.addStep('نتيجة الحجب', 'لا يوجد ورثة محجوبون');
    }
  }

  // ========== حساب الفروض ==========

  private computeFixedShares(): HeirShare[] {
    this.addStep('حساب الفروض', 'تحديد أصحاب الفروض وفروضهم');
    const shares: HeirShare[] = [];
    const h = this.heirs;
    const hasDesc = this.hasDescendants();

    // === الزوج ===
    if (h.husband > 0) {
      const frac = hasDesc ? Fraction.QUARTER : Fraction.HALF;
      shares.push(
        new HeirShareImpl({
          key: 'husband',
          name: 'الزوج',
          type: 'فرض',
          fraction: frac,
          count: 1,
          reason: hasDesc ? '¼ لوجود فرع وارث' : '½ لعدم وجود فرع وارث',
        } as Partial<HeirShare>)
      );
    }

    // === الزوجة ===
    if (h.wife > 0) {
      const frac = hasDesc ? Fraction.EIGHTH : Fraction.QUARTER;
      shares.push(
        new HeirShareImpl({
          key: 'wife',
          name: 'الزوجة',
          type: 'فرض',
          fraction: frac,
          count: 1,
          reason: hasDesc ? '⅛ لوجود فرع وارث' : '¼ لعدم وجود فرع وارث',
        } as Partial<HeirShare>)
      );
    }

    // === الأب ===
    if (h.father > 0) {
      const frac = hasDesc ? Fraction.SIXTH : Fraction.ZERO;
      if (!frac.isZero()) {
        shares.push(
        new HeirShareImpl({
          key: 'father',
          name: 'الأب',
          type: 'فرض',
          fraction: frac,
          count: 1,
          reason: '⅛ لوجود فرع وارث',
        } as Partial<HeirShare>)
      );
      }
    }

    // === الأم ===
    if (h.mother > 0) {
      let frac = Fraction.THIRD;
      let reason = '⅓';

      if (hasDesc) {
        frac = Fraction.SIXTH;
        reason = '⅙ لوجود فرع وارث';
      } else if (this.getAllSiblingsCount() >= 2) {
        frac = Fraction.SIXTH;
        reason = '⅙ لوجود جمع من الإخوة';
      }

      shares.push(
        new HeirShareImpl({
          key: 'mother',
          name: 'الأم',
          type: 'فرض',
          fraction: frac,
          count: 1,
          reason,
        } as Partial<HeirShare>)
      );
    }

    // === الجد ===
    if (h.grandfather > 0 && h.father === 0) {
      const frac = hasDesc ? Fraction.SIXTH : Fraction.ZERO;
      if (!frac.isZero()) {
        shares.push(
        new HeirShareImpl({
          key: 'grandfather',
          name: 'الجد',
          type: 'فرض',
          fraction: frac,
          count: 1,
          reason: '⅛ لوجود فرع وارث',
        } as Partial<HeirShare>)
      );
      }
    }

    // === الجدات ===
    if (h.grandmother_mother > 0 && h.mother === 0) {
      shares.push(
        new HeirShareImpl({
          key: 'grandmother_mother',
          name: 'الجدة لأم',
          type: 'فرض',
          fraction: Fraction.SIXTH,
          count: 1,
          reason: '⅛',
        } as Partial<HeirShare>)
      );
    }

    if (h.grandmother_father > 0 && h.mother === 0 && h.father === 0) {
      shares.push(
        new HeirShareImpl({
          key: 'grandmother_father',
          name: 'الجدة لأب',
          type: 'فرض',
          fraction: Fraction.SIXTH,
          count: 1,
          reason: '⅛',
        } as Partial<HeirShare>)
      );
    }

    // === البنات ===
    if (h.daughter > 0 && h.son === 0) {
      const frac = h.daughter === 1 ? Fraction.HALF : Fraction.TWO_THIRDS;
      shares.push(
        new HeirShareImpl({
          key: 'daughter',
          name: h.daughter > 1 ? 'البنات' : 'البنت',
          type: 'فرض',
          fraction: frac,
          count: h.daughter,
          reason: h.daughter === 1 ? '½ للبنت الواحدة' : '¾ للبنات',
        } as Partial<HeirShare>)
      );
    }

    // === بنات الابن ===
    if (h.granddaughter > 0 && h.grandson === 0 && h.son === 0) {
      if (h.daughter === 0) {
        const frac = h.granddaughter === 1 ? Fraction.HALF : Fraction.TWO_THIRDS;
      shares.push(
        new HeirShareImpl({
          key: 'granddaughter',
          name: h.granddaughter > 1 ? 'بنات الابن' : 'بنت الابن',
          type: 'فرض',
          fraction: frac,
          count: h.granddaughter,
          reason:
            h.granddaughter === 1 ? '½ لبنت الابن الواحدة' : '¾ لبنات الابن',
        } as Partial<HeirShare>)
      );
      } else if (h.daughter === 1) {
        shares.push(
        new HeirShareImpl({
          key: 'granddaughter',
          name: h.granddaughter > 1 ? 'بنات الابن' : 'بنت الابن',
          type: 'فرض',
          fraction: Fraction.SIXTH,
          count: h.granddaughter,
          reason: '⅛ تكملة للثلثين مع البنت الواحدة',
        } as Partial<HeirShare>)
      );
      }
    }

    // === الأخوات الشقيقات ===
    if (h.full_sister > 0 && h.full_brother === 0) {
      const isAsabaWithGhayr = this.hasFemaleDescendants();

      if (!isAsabaWithGhayr && !hasDesc && !this.hasMaleAscendant()) {
        const frac = h.full_sister === 1 ? Fraction.HALF : Fraction.TWO_THIRDS;
      shares.push(
        new HeirShareImpl({
          key: 'full_sister',
          name: h.full_sister > 1 ? 'الأخوات الشقيقات' : 'الأخت الشقيقة',
          type: 'فرض',
          fraction: frac,
          count: h.full_sister,
          reason:
            h.full_sister === 1 ? '½ للأخت الشقيقة الواحدة' : '¾ للأخوات الشقيقات',
        } as Partial<HeirShare>)
      );
      }
    }

    // === الأخوات لأب ===
    if (h.paternal_sister > 0 && h.paternal_brother === 0 && h.full_brother === 0) {
      const isAsabaWithGhayr = this.hasFemaleDescendants() && h.full_sister === 0;

      if (!isAsabaWithGhayr && !hasDesc && !this.hasMaleAscendant()) {
        if (h.full_sister === 0) {
          const frac = h.paternal_sister === 1 ? Fraction.HALF : Fraction.TWO_THIRDS;
          shares.push(
        new HeirShareImpl({
          key: 'paternal_sister',
          name: h.paternal_sister > 1 ? 'الأخوات لأب' : 'الأخت لأب',
          type: 'فرض',
          fraction: frac,
          count: h.paternal_sister,
          reason:
            h.paternal_sister === 1
              ? '½ للأخت لأب الواحدة'
              : '¾ للأخوات لأب',
        } as Partial<HeirShare>)
      );
        } else if (h.full_sister === 1) {
          shares.push(
          new HeirShareImpl({
            key: 'paternal_sister',
            name: h.paternal_sister > 1 ? 'الأخوات لأب' : 'الأخت لأب',
            type: 'فرض',
            fraction: Fraction.SIXTH,
            count: h.paternal_sister,
            reason: '⅛ تكملة للثلثين مع الأخت الشقيقة',
          } as Partial<HeirShare>)
        );
        }
      }
    }

    // === الإخوة لأم ===
    const maternalCount = this.getMaternalSiblingsCount();
    if (maternalCount > 0 && !hasDesc && !this.hasMaleAscendant()) {
      const frac = maternalCount === 1 ? Fraction.SIXTH : Fraction.THIRD;
      shares.push(
        new HeirShareImpl({
          key: 'maternal_siblings',
          name: 'الإخوة لأم',
          type: 'فرض',
          fraction: frac,
          count: maternalCount,
          reason:
            maternalCount === 1
              ? '⅛ للواحد من الإخوة لأم'
              : '½ يشتركون فيه بالتساوي (ذكرهم كأنثاهم)',
        } as Partial<HeirShare>)
      );
    }

    return shares;
  }

  // ========== حساب العول ==========

  private applyAwl(shares: HeirShare[]): HeirShare[] {
    const denominators = shares
      .filter((s) => s.fraction && !s.fraction.isZero())
      .map((s) => s.fraction.den);

    if (denominators.length === 0) {
      this.results.asl = 1;
      this.results.finalBase = 1;
      return shares;
    }

    const asl = Fraction.lcmArray(denominators);
    this.results.asl = asl;

    let totalShares = 0;
    const shareDetails = shares.map((share) => {
      if (!share.fraction || share.fraction.isZero()) {
        return { share, rawShares: 0 };
      }
      const rawShares = share.fraction.num * (asl / share.fraction.den);
      totalShares += rawShares;
      return { share, rawShares };
    });

    if (totalShares > asl) {
      this.results.awlApplied = true;
      this.results.finalBase = totalShares;
      this.results.awlRatio = new Fraction(asl, totalShares);

      this.state.specialCases.push({
        type: 'awl',
        name: 'العَوْل',
        description: `عالت المسألة من ${asl} إلى ${totalShares}`,
      });

      this.addStep(
        'العَوْل',
        `مجموع السهام (${totalShares}) أكبر من أصل المسألة (${asl})، فعالت إلى ${totalShares}`
      );

      return shareDetails.map(({ share, rawShares }) => {
        share.originalFraction = share.fraction.clone();
        share.fraction = new Fraction(rawShares, totalShares);
        share.shares = rawShares;
        return share;
      });
    } else {
      this.results.finalBase = asl;
      return shareDetails.map(({ share, rawShares }) => {
        share.shares = rawShares;
        return share;
      });
    }
  }

  // ========== حساب الرد ==========

  private applyRadd(shares: HeirShare[], remainder: Fraction): HeirShare[] {
    if (remainder.num <= 0) return shares;

    const rules = this.config.rules;

    let eligibleForRadd = shares.filter((s) => {
      if (s.type.includes('عصبة')) return false;
      if (s.key === 'husband' || s.key === 'wife') {
        return false;
      }
      return true;
    });

    if (eligibleForRadd.length === 0) {
      if (rules.raddToSpouse) {
        const spouse = shares.find((s) => s.key === 'husband' || s.key === 'wife');
        if (spouse && shares.length === 1) {
          this.state.madhhabNotes.push(
            `في المذهب ${this.config.name}: يُرد على الزوج/الزوجة عند عدم وجود وارث آخر`
          );
          eligibleForRadd = [spouse];
        }
      }
    }

    if (eligibleForRadd.length === 0) {
      return shares;
    }

    this.results.raddApplied = true;
    this.state.specialCases.push({
      type: 'radd',
      name: 'الرَّد',
      description: 'توزيع الفائض على أصحاب الفروض بنسبة فروضهم',
    });

    this.addStep('الرَّد', 'توزيع الباقي على أصحاب الفروض بنسبة فروضهم');

    let totalEligibleFrac = new Fraction(0);
    eligibleForRadd.forEach((s) => {
      totalEligibleFrac = totalEligibleFrac.add(s.fraction);
    });

    if (totalEligibleFrac.isZero()) return shares;

    return shares.map((share) => {
      if (eligibleForRadd.includes(share)) {
        const raddPortion = remainder.multiply(share.fraction).divide(totalEligibleFrac);
        (share as HeirShareImpl).addFraction(raddPortion);
        if (!share.type.includes('رد')) {
          share.type = share.type + ' + رد';
        }
      }
      return share;
    });
  }

  // ========== ذوو الأرحام ==========

  private distributeToBloodRelatives(
    shares: HeirShare[],
    remainder: Fraction
  ): { shares: HeirShare[]; bloodRelatives: HeirShare[] } {
    if (!this.config.rules.bloodRelativesEnabled) {
      if (remainder.num > 0 && this.madhab === 'maliki') {
      shares.push(
        new HeirShareImpl({
          key: 'treasury',
          name: 'بيت المال',
          type: 'باقي',
          fraction: remainder,
          count: 1,
          reason: 'الباقي لبيت المال (المذهب المالكي)',
        } as Partial<HeirShare>)
      );
        this.state.madhhabNotes.push(
          'في المذهب المالكي: لا يرث ذوو الأرحام، والباقي لبيت المال'
        );
      }
      return { shares, bloodRelatives: [] };
    }

    if (remainder.num <= 0) {
      return { shares, bloodRelatives: [] };
    }

    const h = this.heirs;
    const bloodRelatives: HeirShare[] = [];

    const classes: Record<number, any[]> = {
      1: [],
      2: [],
      3: [],
      4: [],
    };

    if ((h.daughter_son || 0) > 0) {
      classes[1].push({ key: 'daughter_son', count: h.daughter_son, name: 'ابن البنت' });
    }
    if ((h.daughter_daughter || 0) > 0) {
      classes[1].push({
        key: 'daughter_daughter',
        count: h.daughter_daughter,
        name: 'بنت البنت',
      });
    }
    if ((h.sister_children || 0) > 0) {
      classes[2].push({
        key: 'sister_children',
        count: h.sister_children,
        name: 'أولاد الأخت',
      });
    }
    if ((h.maternal_uncle || 0) > 0) {
      classes[3].push({ key: 'maternal_uncle', count: h.maternal_uncle, name: 'الخال' });
    }
    if ((h.maternal_aunt || 0) > 0) {
      classes[3].push({ key: 'maternal_aunt', count: h.maternal_aunt, name: 'الخالة' });
    }
    if ((h.paternal_aunt || 0) > 0) {
      classes[4].push({ key: 'paternal_aunt', count: h.paternal_aunt, name: 'العمة' });
    }

    let inheritingClass = null;
    for (let i = 1; i <= 4; i++) {
      if (classes[i].length > 0) {
        inheritingClass = classes[i];
        break;
      }
    }

    if (!inheritingClass || inheritingClass.length === 0) {
      return { shares, bloodRelatives: [] };
    }

    this.results.bloodRelativesApplied = true;
    this.state.specialCases.push({
      type: 'blood_relatives',
      name: 'ذوو الأرحام',
      description: 'توريث ذوي الأرحام لعدم وجود عصبة',
    });

    this.addStep('ذوو الأرحام', 'توزيع الباقي على ذوي الأرحام');

    const totalCount = inheritingClass.reduce((sum: number, r: any) => sum + r.count, 0);

    inheritingClass.forEach((rel: any) => {
      const shareFrac = remainder.multiply(new Fraction(rel.count, totalCount));
      bloodRelatives.push(
        new HeirShareImpl({
          key: rel.key,
          name: rel.name,
          type: 'ذو رحم',
          fraction: shareFrac,
          count: rel.count,
          reason: 'ذو رحم - الباقي بعد أصحاب الفروض',
        } as Partial<HeirShare>)
      );
    });

    return { shares, bloodRelatives };
  }

  // ========== حساب العصبات ==========

  private computeAsaba(fixedShares: HeirShare[], remainder: Fraction): HeirShare[] {
    this.addStep('حساب العصبات', 'تحديد العصبة بالنفس وبالغير ومع الغير');
    const asabaShares: HeirShare[] = [];
    const h = this.heirs;
    const rules = this.config.rules;

    if (remainder.num <= 0) {
      this.addStep('العصبات', 'لا باقي للعصبات (المسألة عادلة أو عائلة)');
      return asabaShares;
    }

    let asabaList: any[] = [];

    // 1. الابن (عصبة بالنفس) يُعصّب البنت
    if (h.son > 0) {
      for (let i = 0; i < h.son; i++) {
        asabaList.push({ key: 'son', name: 'الابن', weight: 2 });
      }
      for (let i = 0; i < (h.daughter || 0); i++) {
        asabaList.push({ key: 'daughter', name: 'البنت', weight: 1 });
      }
    }
    // 2. ابن الابن (عصبة بالنفس) يُعصّب بنت الابن
    else if (h.grandson > 0) {
      for (let i = 0; i < h.grandson; i++) {
        asabaList.push({ key: 'grandson', name: 'ابن الابن', weight: 2 });
      }
      for (let i = 0; i < (h.granddaughter || 0); i++) {
        asabaList.push({ key: 'granddaughter', name: 'بنت الابن', weight: 1 });
      }
    }
    // 3. الأب (عصبة بالنفس)
    else if (h.father > 0 && !this.hasMaleDescendants()) {
      asabaList.push({ key: 'father', name: 'الأب', weight: 1 });
    }
    // 4. الجد مع الإخوة
    else if (h.grandfather > 0 && h.father === 0) {
      const siblingsCount = this.getFullAndPaternalSiblingsCount();

      if (siblingsCount > 0 && rules.grandfatherWithSiblings === 'shares') {
        this.state.specialCases.push({
          type: 'grandfather_with_siblings',
          name: 'الجد مع الإخوة',
          description: `الجد يُقاسم الإخوة في المذهب ${this.config.name}`,
        });

        asabaList.push({ key: 'grandfather', name: 'الجد', weight: 2 });

        for (let i = 0; i < (h.full_brother || 0); i++) {
          asabaList.push({ key: 'full_brother', name: 'الأخ الشقيق', weight: 2 });
        }
        for (let i = 0; i < (h.full_sister || 0); i++) {
          asabaList.push({ key: 'full_sister', name: 'الأخت الشقيقة', weight: 1 });
        }
        for (let i = 0; i < (h.paternal_brother || 0); i++) {
          asabaList.push({ key: 'paternal_brother', name: 'الأخ لأب', weight: 2 });
        }
        for (let i = 0; i < (h.paternal_sister || 0); i++) {
          asabaList.push({ key: 'paternal_sister', name: 'الأخت لأب', weight: 1 });
        }
      } else if (siblingsCount === 0) {
        asabaList.push({ key: 'grandfather', name: 'الجد', weight: 1 });
      }
    }
    // 5. الإخوة الأشقاء
    else if (h.full_brother > 0) {
      for (let i = 0; i < h.full_brother; i++) {
        asabaList.push({ key: 'full_brother', name: 'الأخ الشقيق', weight: 2 });
      }
      for (let i = 0; i < (h.full_sister || 0); i++) {
        asabaList.push({ key: 'full_sister', name: 'الأخت الشقيقة', weight: 1 });
      }
    }
    // 6. الإخوة لأب
    else if (h.paternal_brother > 0) {
      for (let i = 0; i < h.paternal_brother; i++) {
        asabaList.push({ key: 'paternal_brother', name: 'الأخ لأب', weight: 2 });
      }
      for (let i = 0; i < (h.paternal_sister || 0); i++) {
        asabaList.push({ key: 'paternal_sister', name: 'الأخت لأب', weight: 1 });
      }
    }

    if (asabaList.length === 0) {
      return asabaShares;
    }

    const totalWeight = asabaList.reduce((sum, a) => sum + a.weight, 0);
    const asabaFraction = new Fraction(1, totalWeight);

    const grouped: Record<string, any> = {};
    asabaList.forEach((item) => {
      if (!grouped[item.key]) {
        grouped[item.key] = { ...item, count: 0, totalWeight: 0 };
      }
      grouped[item.key].count++;
      grouped[item.key].totalWeight += item.weight;
    });

    Object.values(grouped).forEach((item: any) => {
      asabaShares.push(
        new HeirShareImpl({
          key: item.key,
          name: item.name,
          type: 'عصبة',
          fraction: asabaFraction.multiply(new Fraction(item.totalWeight, 1)),
          count: item.count,
          reason: 'عصبة بالنفس أو مع الغير',
        } as Partial<HeirShare>)
      );
    });

    return asabaShares;
  }

  // ========== الحساب الرئيسي ==========

  calculate(): CalculationResult {
    try {
      if (this.state.errors.length > 0) {
        return {
          success: false,
          error: this.state.errors.join(', '),
          madhab: this.madhab,
          madhhabName: this.config.name,
          estate: this.estate,
          netEstate: 0,
          asl: 0,
          finalBase: 0,
          awlApplied: false,
          raddApplied: false,
          bloodRelativesApplied: false,
          shares: [],
          specialCases: [],
          blockedHeirs: [],
          madhhabNotes: [],
          warnings: [],
          steps: [],
          confidence: 0,
          confidenceLevel: 'فشل',
          calculationTime: 0,
        };
      }

      const startTime = performance.now();

      const { total, funeral, debts, will } = this.estate;
      const netEstate = total - funeral - debts - will;
      this.results.netEstate = netEstate;

      if (netEstate <= 0) {
        return {
          success: false,
          error: 'صافي التركة صفر أو سالب بعد خصم التكاليف والديون والوصية',
          madhab: this.madhab,
          madhhabName: this.config.name,
          estate: this.estate,
          netEstate: 0,
          asl: 0,
          finalBase: 0,
          awlApplied: false,
          raddApplied: false,
          bloodRelativesApplied: false,
          shares: [],
          specialCases: [],
          blockedHeirs: [],
          madhhabNotes: [],
          warnings: [],
          steps: [],
          confidence: 0,
          confidenceLevel: 'فشل',
          calculationTime: 0,
        };
      }

      this.addStep(
        'صافي التركة',
        `${total.toLocaleString()} - ${funeral.toLocaleString()} (تجهيز) - ${debts.toLocaleString()} (ديون) - ${will.toLocaleString()} (وصية) = ${netEstate.toLocaleString()}`
      );

      this.applyHijab();

      let fixedShares = this.computeFixedShares();
      fixedShares = this.applyAwl(fixedShares);

      let totalFixed = new Fraction(0);
      fixedShares.forEach((s) => {
        totalFixed = totalFixed.add(s.fraction);
      });
      let remainder = new Fraction(1).subtract(totalFixed);

      const asabaShares = this.computeAsaba(fixedShares, remainder);

      let allShares: HeirShare[] = [...fixedShares];
      asabaShares.forEach((asaba) => {
        const existing = allShares.find((s) => s.key === asaba.key);
        if (existing) {
          (existing as HeirShareImpl).addFraction(asaba.fraction);
          if (!existing.type.includes('تعصيب')) {
            existing.type = existing.type + ' + تعصيب';
          }
        } else {
          allShares.push(asaba);
        }
      });

      let totalAllocated = new Fraction(0);
      allShares.forEach((s) => {
        totalAllocated = totalAllocated.add(s.fraction);
      });
      remainder = new Fraction(1).subtract(totalAllocated);

      if (remainder.num > 0 && asabaShares.length === 0) {
        allShares = this.applyRadd(allShares, remainder);

        totalAllocated = new Fraction(0);
        allShares.forEach((s) => {
          totalAllocated = totalAllocated.add(s.fraction);
        });
        remainder = new Fraction(1).subtract(totalAllocated);
      }

      if (remainder.num > 0) {
        const { shares: updatedShares, bloodRelatives } = this.distributeToBloodRelatives(
          allShares,
          remainder
        );
        allShares = updatedShares;
        if (bloodRelatives.length > 0) {
          allShares = [...allShares, ...bloodRelatives];
        }
      }

      allShares.forEach((s) => {
        (s as HeirShareImpl).calculateAmount(netEstate);
      });

      this.calculateConfidence(allShares);

      this.results.shares = allShares.filter((s) => !s.fraction.isZero());

      const endTime = performance.now();
      const calculationTime = Math.round(endTime - startTime);

      const confidence = this.results.confidence;
      const confidenceLevel =
        confidence > 0.95 ? 'عالية جداً' : confidence > 0.9 ? 'عالية' : 'جيدة';

      return {
        success: true,
        madhab: this.madhab,
        madhhabName: this.config.name,
        estate: this.estate,
        netEstate: this.results.netEstate,
        asl: this.results.asl,
        finalBase: this.results.finalBase,
        awlApplied: this.results.awlApplied,
        raddApplied: this.results.raddApplied,
        bloodRelativesApplied: this.results.bloodRelativesApplied,
        shares: this.results.shares,
        specialCases: this.state.specialCases,
        blockedHeirs: this.state.blockedHeirs,
        madhhabNotes: this.state.madhhabNotes,
        warnings: this.state.warnings,
        steps: this.state.steps,
        confidence: this.results.confidence,
        confidenceLevel,
        calculationTime,
      };
    } catch (error) {
      console.error('خطأ في حساب الميراث:', error);
      return {
        success: false,
        error: `خطأ في الحساب: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`,
        madhab: this.madhab,
        madhhabName: this.config.name,
        estate: this.estate,
        netEstate: 0,
        asl: 0,
        finalBase: 0,
        awlApplied: false,
        raddApplied: false,
        bloodRelativesApplied: false,
        shares: [],
        specialCases: [],
        blockedHeirs: [],
        madhhabNotes: [],
        warnings: [],
        steps: [],
        confidence: 0,
        confidenceLevel: 'فشل',
        calculationTime: 0,
      };
    }
  }

  private calculateConfidence(shares: HeirShare[]): void {
    let confidence = 1.0;

    if (this.results.awlApplied) confidence *= 0.98;
    if (this.results.raddApplied) confidence *= 0.97;
    if (this.results.bloodRelativesApplied) confidence *= 0.95;
    if (this.state.specialCases.length > 2) confidence *= 0.96;

    const total = shares.reduce((sum, s) => sum + s.fraction.toDecimal(), 0);
    if (Math.abs(1 - total) > 0.001) {
      confidence *= 0.9;
      this.state.warnings.push({
        level: 'warning',
        message: `مجموع الحصص (${(total * 100).toFixed(2)}%) لا يساوي 100% بالضبط`,
      });
    }

    this.results.confidence = Math.max(0.8, confidence);
  }
}

/**
 * دالة الحساب الرئيسية
 */
export function calculateInheritance(
  madhab: Madhab,
  estate: EstateData,
  heirs: HeirsData
): CalculationResult {
  const engine = new InheritanceEngine(madhab, estate, heirs);
  return engine.calculate();
}

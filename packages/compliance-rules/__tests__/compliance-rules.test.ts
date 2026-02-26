import {
  evaluateRuleSync, evaluateRule, evaluateRules, generateReport, runCompliance,
  makeRule, makeContext, filterByStatus, filterBySeverity, filterByStandard,
  isValidStatus, isValidSeverity, isValidStandard, scoreLabel,
  mandatoryFailures, hasBlockingFailure,
  RuleStatus, RuleSeverity, StandardType, ComplianceRule, RuleResult, RuleContext,
} from '../src/index';

function makeResult(ruleId: string, status: RuleStatus, severity: RuleSeverity = 'minor', ruleName = 'T'): RuleResult {
  return { ruleId, ruleName, status, severity, timestamp: Date.now() };
}
const statuses: RuleStatus[] = ['pass','fail','warning','na','pending'];
const severities: RuleSeverity[] = ['critical','major','minor','info'];
const standards: StandardType[] = ['ISO_9001','ISO_14001','ISO_45001','ISO_27001','GDPR','CUSTOM'];
const invSt: string[] = ['','unknown','PASS','FAIL','Warning','NA','PENDING'];
const invSev: string[] = ['','high','low','CRITICAL','Major','MINOR','INFO'];
const invStd: string[] = ['','ISO9001','iso_9001','GDPR2','CUSTOM2','PCI_DSS'];

describe('isValidStatus', () => {
  statuses.forEach(s => { it('valid: ' + s, () => { expect(isValidStatus(s)).toBe(true); }); });
  invSt.forEach(s => { it('invalid: ' + s, () => { expect(isValidStatus(s)).toBe(false); }); });
  it('isValidStatus rejects s_0', () => { expect(isValidStatus('status_0')).toBe(false); });
  it('isValidStatus rejects s_1', () => { expect(isValidStatus('status_1')).toBe(false); });
  it('isValidStatus rejects s_2', () => { expect(isValidStatus('status_2')).toBe(false); });
  it('isValidStatus rejects s_3', () => { expect(isValidStatus('status_3')).toBe(false); });
  it('isValidStatus rejects s_4', () => { expect(isValidStatus('status_4')).toBe(false); });
  it('isValidStatus rejects s_5', () => { expect(isValidStatus('status_5')).toBe(false); });
  it('isValidStatus rejects s_6', () => { expect(isValidStatus('status_6')).toBe(false); });
  it('isValidStatus rejects s_7', () => { expect(isValidStatus('status_7')).toBe(false); });
  it('isValidStatus rejects s_8', () => { expect(isValidStatus('status_8')).toBe(false); });
  it('isValidStatus rejects s_9', () => { expect(isValidStatus('status_9')).toBe(false); });
  it('isValidStatus rejects s_10', () => { expect(isValidStatus('status_10')).toBe(false); });
  it('isValidStatus rejects s_11', () => { expect(isValidStatus('status_11')).toBe(false); });
  it('isValidStatus rejects s_12', () => { expect(isValidStatus('status_12')).toBe(false); });
  it('isValidStatus rejects s_13', () => { expect(isValidStatus('status_13')).toBe(false); });
  it('isValidStatus rejects s_14', () => { expect(isValidStatus('status_14')).toBe(false); });
  it('isValidStatus rejects s_15', () => { expect(isValidStatus('status_15')).toBe(false); });
  it('isValidStatus rejects s_16', () => { expect(isValidStatus('status_16')).toBe(false); });
  it('isValidStatus rejects s_17', () => { expect(isValidStatus('status_17')).toBe(false); });
  it('isValidStatus rejects s_18', () => { expect(isValidStatus('status_18')).toBe(false); });
  it('isValidStatus rejects s_19', () => { expect(isValidStatus('status_19')).toBe(false); });
  it('isValidStatus rejects s_20', () => { expect(isValidStatus('status_20')).toBe(false); });
  it('isValidStatus rejects s_21', () => { expect(isValidStatus('status_21')).toBe(false); });
  it('isValidStatus rejects s_22', () => { expect(isValidStatus('status_22')).toBe(false); });
  it('isValidStatus rejects s_23', () => { expect(isValidStatus('status_23')).toBe(false); });
  it('isValidStatus rejects s_24', () => { expect(isValidStatus('status_24')).toBe(false); });
  it('isValidStatus rejects s_25', () => { expect(isValidStatus('status_25')).toBe(false); });
  it('isValidStatus rejects s_26', () => { expect(isValidStatus('status_26')).toBe(false); });
  it('isValidStatus rejects s_27', () => { expect(isValidStatus('status_27')).toBe(false); });
  it('isValidStatus rejects s_28', () => { expect(isValidStatus('status_28')).toBe(false); });
  it('isValidStatus rejects s_29', () => { expect(isValidStatus('status_29')).toBe(false); });
  it('isValidStatus rejects s_30', () => { expect(isValidStatus('status_30')).toBe(false); });
  it('isValidStatus rejects s_31', () => { expect(isValidStatus('status_31')).toBe(false); });
  it('isValidStatus rejects s_32', () => { expect(isValidStatus('status_32')).toBe(false); });
  it('isValidStatus rejects s_33', () => { expect(isValidStatus('status_33')).toBe(false); });
  it('isValidStatus rejects s_34', () => { expect(isValidStatus('status_34')).toBe(false); });
  it('isValidStatus rejects s_35', () => { expect(isValidStatus('status_35')).toBe(false); });
  it('isValidStatus rejects s_36', () => { expect(isValidStatus('status_36')).toBe(false); });
  it('isValidStatus rejects s_37', () => { expect(isValidStatus('status_37')).toBe(false); });
  it('isValidStatus rejects s_38', () => { expect(isValidStatus('status_38')).toBe(false); });
  it('isValidStatus rejects s_39', () => { expect(isValidStatus('status_39')).toBe(false); });
  it('isValidStatus rejects s_40', () => { expect(isValidStatus('status_40')).toBe(false); });
  it('isValidStatus rejects s_41', () => { expect(isValidStatus('status_41')).toBe(false); });
  it('isValidStatus rejects s_42', () => { expect(isValidStatus('status_42')).toBe(false); });
  it('isValidStatus rejects s_43', () => { expect(isValidStatus('status_43')).toBe(false); });
  it('isValidStatus rejects s_44', () => { expect(isValidStatus('status_44')).toBe(false); });
  it('isValidStatus rejects s_45', () => { expect(isValidStatus('status_45')).toBe(false); });
  it('isValidStatus rejects s_46', () => { expect(isValidStatus('status_46')).toBe(false); });
  it('isValidStatus rejects s_47', () => { expect(isValidStatus('status_47')).toBe(false); });
  it('isValidStatus rejects s_48', () => { expect(isValidStatus('status_48')).toBe(false); });
  it('isValidStatus rejects s_49', () => { expect(isValidStatus('status_49')).toBe(false); });
  it('isValidStatus n0', () => { expect(isValidStatus(String(0))).toBe(false); });
  it('isValidStatus n1', () => { expect(isValidStatus(String(1))).toBe(false); });
  it('isValidStatus n2', () => { expect(isValidStatus(String(2))).toBe(false); });
  it('isValidStatus n3', () => { expect(isValidStatus(String(3))).toBe(false); });
  it('isValidStatus n4', () => { expect(isValidStatus(String(4))).toBe(false); });
  it('isValidStatus n5', () => { expect(isValidStatus(String(5))).toBe(false); });
  it('isValidStatus n6', () => { expect(isValidStatus(String(6))).toBe(false); });
  it('isValidStatus n7', () => { expect(isValidStatus(String(7))).toBe(false); });
  it('isValidStatus n8', () => { expect(isValidStatus(String(8))).toBe(false); });
  it('isValidStatus n9', () => { expect(isValidStatus(String(9))).toBe(false); });
  it('isValidStatus n10', () => { expect(isValidStatus(String(10))).toBe(false); });
  it('isValidStatus n11', () => { expect(isValidStatus(String(11))).toBe(false); });
  it('isValidStatus n12', () => { expect(isValidStatus(String(12))).toBe(false); });
  it('isValidStatus n13', () => { expect(isValidStatus(String(13))).toBe(false); });
  it('isValidStatus n14', () => { expect(isValidStatus(String(14))).toBe(false); });
  it('isValidStatus n15', () => { expect(isValidStatus(String(15))).toBe(false); });
  it('isValidStatus n16', () => { expect(isValidStatus(String(16))).toBe(false); });
  it('isValidStatus n17', () => { expect(isValidStatus(String(17))).toBe(false); });
  it('isValidStatus n18', () => { expect(isValidStatus(String(18))).toBe(false); });
  it('isValidStatus n19', () => { expect(isValidStatus(String(19))).toBe(false); });
  it('isValidStatus n20', () => { expect(isValidStatus(String(20))).toBe(false); });
  it('isValidStatus n21', () => { expect(isValidStatus(String(21))).toBe(false); });
  it('isValidStatus n22', () => { expect(isValidStatus(String(22))).toBe(false); });
  it('isValidStatus n23', () => { expect(isValidStatus(String(23))).toBe(false); });
  it('isValidStatus n24', () => { expect(isValidStatus(String(24))).toBe(false); });
  it('isValidStatus n25', () => { expect(isValidStatus(String(25))).toBe(false); });
  it('isValidStatus n26', () => { expect(isValidStatus(String(26))).toBe(false); });
  it('isValidStatus n27', () => { expect(isValidStatus(String(27))).toBe(false); });
  it('isValidStatus n28', () => { expect(isValidStatus(String(28))).toBe(false); });
  it('isValidStatus n29', () => { expect(isValidStatus(String(29))).toBe(false); });
  it('isValidStatus n30', () => { expect(isValidStatus(String(30))).toBe(false); });
  it('isValidStatus n31', () => { expect(isValidStatus(String(31))).toBe(false); });
  it('isValidStatus n32', () => { expect(isValidStatus(String(32))).toBe(false); });
  it('isValidStatus n33', () => { expect(isValidStatus(String(33))).toBe(false); });
  it('isValidStatus n34', () => { expect(isValidStatus(String(34))).toBe(false); });
  it('isValidStatus n35', () => { expect(isValidStatus(String(35))).toBe(false); });
  it('isValidStatus n36', () => { expect(isValidStatus(String(36))).toBe(false); });
  it('isValidStatus n37', () => { expect(isValidStatus(String(37))).toBe(false); });
  it('isValidStatus n38', () => { expect(isValidStatus(String(38))).toBe(false); });
  it('isValidStatus n39', () => { expect(isValidStatus(String(39))).toBe(false); });
  it('isValidStatus n40', () => { expect(isValidStatus(String(40))).toBe(false); });
  it('isValidStatus n41', () => { expect(isValidStatus(String(41))).toBe(false); });
  it('isValidStatus n42', () => { expect(isValidStatus(String(42))).toBe(false); });
  it('isValidStatus n43', () => { expect(isValidStatus(String(43))).toBe(false); });
  it('isValidStatus n44', () => { expect(isValidStatus(String(44))).toBe(false); });
  it('isValidStatus n45', () => { expect(isValidStatus(String(45))).toBe(false); });
  it('isValidStatus n46', () => { expect(isValidStatus(String(46))).toBe(false); });
  it('isValidStatus n47', () => { expect(isValidStatus(String(47))).toBe(false); });
  it('isValidStatus n48', () => { expect(isValidStatus(String(48))).toBe(false); });
  it('isValidStatus n49', () => { expect(isValidStatus(String(49))).toBe(false); });
});

describe('isValidSeverity', () => {
  severities.forEach(s => { it('valid sev: ' + s, () => { expect(isValidSeverity(s)).toBe(true); }); });
  invSev.forEach(s => { it('invalid sev: ' + s, () => { expect(isValidSeverity(s)).toBe(false); }); });
  it('isValidSeverity rejects sev_0', () => { expect(isValidSeverity('sev_0')).toBe(false); });
  it('isValidSeverity rejects sev_1', () => { expect(isValidSeverity('sev_1')).toBe(false); });
  it('isValidSeverity rejects sev_2', () => { expect(isValidSeverity('sev_2')).toBe(false); });
  it('isValidSeverity rejects sev_3', () => { expect(isValidSeverity('sev_3')).toBe(false); });
  it('isValidSeverity rejects sev_4', () => { expect(isValidSeverity('sev_4')).toBe(false); });
  it('isValidSeverity rejects sev_5', () => { expect(isValidSeverity('sev_5')).toBe(false); });
  it('isValidSeverity rejects sev_6', () => { expect(isValidSeverity('sev_6')).toBe(false); });
  it('isValidSeverity rejects sev_7', () => { expect(isValidSeverity('sev_7')).toBe(false); });
  it('isValidSeverity rejects sev_8', () => { expect(isValidSeverity('sev_8')).toBe(false); });
  it('isValidSeverity rejects sev_9', () => { expect(isValidSeverity('sev_9')).toBe(false); });
  it('isValidSeverity rejects sev_10', () => { expect(isValidSeverity('sev_10')).toBe(false); });
  it('isValidSeverity rejects sev_11', () => { expect(isValidSeverity('sev_11')).toBe(false); });
  it('isValidSeverity rejects sev_12', () => { expect(isValidSeverity('sev_12')).toBe(false); });
  it('isValidSeverity rejects sev_13', () => { expect(isValidSeverity('sev_13')).toBe(false); });
  it('isValidSeverity rejects sev_14', () => { expect(isValidSeverity('sev_14')).toBe(false); });
  it('isValidSeverity rejects sev_15', () => { expect(isValidSeverity('sev_15')).toBe(false); });
  it('isValidSeverity rejects sev_16', () => { expect(isValidSeverity('sev_16')).toBe(false); });
  it('isValidSeverity rejects sev_17', () => { expect(isValidSeverity('sev_17')).toBe(false); });
  it('isValidSeverity rejects sev_18', () => { expect(isValidSeverity('sev_18')).toBe(false); });
  it('isValidSeverity rejects sev_19', () => { expect(isValidSeverity('sev_19')).toBe(false); });
  it('isValidSeverity rejects sev_20', () => { expect(isValidSeverity('sev_20')).toBe(false); });
  it('isValidSeverity rejects sev_21', () => { expect(isValidSeverity('sev_21')).toBe(false); });
  it('isValidSeverity rejects sev_22', () => { expect(isValidSeverity('sev_22')).toBe(false); });
  it('isValidSeverity rejects sev_23', () => { expect(isValidSeverity('sev_23')).toBe(false); });
  it('isValidSeverity rejects sev_24', () => { expect(isValidSeverity('sev_24')).toBe(false); });
  it('isValidSeverity rejects sev_25', () => { expect(isValidSeverity('sev_25')).toBe(false); });
  it('isValidSeverity rejects sev_26', () => { expect(isValidSeverity('sev_26')).toBe(false); });
  it('isValidSeverity rejects sev_27', () => { expect(isValidSeverity('sev_27')).toBe(false); });
  it('isValidSeverity rejects sev_28', () => { expect(isValidSeverity('sev_28')).toBe(false); });
  it('isValidSeverity rejects sev_29', () => { expect(isValidSeverity('sev_29')).toBe(false); });
  it('isValidSeverity rejects sev_30', () => { expect(isValidSeverity('sev_30')).toBe(false); });
  it('isValidSeverity rejects sev_31', () => { expect(isValidSeverity('sev_31')).toBe(false); });
  it('isValidSeverity rejects sev_32', () => { expect(isValidSeverity('sev_32')).toBe(false); });
  it('isValidSeverity rejects sev_33', () => { expect(isValidSeverity('sev_33')).toBe(false); });
  it('isValidSeverity rejects sev_34', () => { expect(isValidSeverity('sev_34')).toBe(false); });
  it('isValidSeverity rejects sev_35', () => { expect(isValidSeverity('sev_35')).toBe(false); });
  it('isValidSeverity rejects sev_36', () => { expect(isValidSeverity('sev_36')).toBe(false); });
  it('isValidSeverity rejects sev_37', () => { expect(isValidSeverity('sev_37')).toBe(false); });
  it('isValidSeverity rejects sev_38', () => { expect(isValidSeverity('sev_38')).toBe(false); });
  it('isValidSeverity rejects sev_39', () => { expect(isValidSeverity('sev_39')).toBe(false); });
  it('isValidSeverity rejects sev_40', () => { expect(isValidSeverity('sev_40')).toBe(false); });
  it('isValidSeverity rejects sev_41', () => { expect(isValidSeverity('sev_41')).toBe(false); });
  it('isValidSeverity rejects sev_42', () => { expect(isValidSeverity('sev_42')).toBe(false); });
  it('isValidSeverity rejects sev_43', () => { expect(isValidSeverity('sev_43')).toBe(false); });
  it('isValidSeverity rejects sev_44', () => { expect(isValidSeverity('sev_44')).toBe(false); });
  it('isValidSeverity rejects sev_45', () => { expect(isValidSeverity('sev_45')).toBe(false); });
  it('isValidSeverity rejects sev_46', () => { expect(isValidSeverity('sev_46')).toBe(false); });
  it('isValidSeverity rejects sev_47', () => { expect(isValidSeverity('sev_47')).toBe(false); });
  it('isValidSeverity rejects sev_48', () => { expect(isValidSeverity('sev_48')).toBe(false); });
  it('isValidSeverity rejects sev_49', () => { expect(isValidSeverity('sev_49')).toBe(false); });
  it('isValidSeverity n0', () => { expect(isValidSeverity(String(0))).toBe(false); });
  it('isValidSeverity n1', () => { expect(isValidSeverity(String(1))).toBe(false); });
  it('isValidSeverity n2', () => { expect(isValidSeverity(String(2))).toBe(false); });
  it('isValidSeverity n3', () => { expect(isValidSeverity(String(3))).toBe(false); });
  it('isValidSeverity n4', () => { expect(isValidSeverity(String(4))).toBe(false); });
  it('isValidSeverity n5', () => { expect(isValidSeverity(String(5))).toBe(false); });
  it('isValidSeverity n6', () => { expect(isValidSeverity(String(6))).toBe(false); });
  it('isValidSeverity n7', () => { expect(isValidSeverity(String(7))).toBe(false); });
  it('isValidSeverity n8', () => { expect(isValidSeverity(String(8))).toBe(false); });
  it('isValidSeverity n9', () => { expect(isValidSeverity(String(9))).toBe(false); });
  it('isValidSeverity n10', () => { expect(isValidSeverity(String(10))).toBe(false); });
  it('isValidSeverity n11', () => { expect(isValidSeverity(String(11))).toBe(false); });
  it('isValidSeverity n12', () => { expect(isValidSeverity(String(12))).toBe(false); });
  it('isValidSeverity n13', () => { expect(isValidSeverity(String(13))).toBe(false); });
  it('isValidSeverity n14', () => { expect(isValidSeverity(String(14))).toBe(false); });
  it('isValidSeverity n15', () => { expect(isValidSeverity(String(15))).toBe(false); });
  it('isValidSeverity n16', () => { expect(isValidSeverity(String(16))).toBe(false); });
  it('isValidSeverity n17', () => { expect(isValidSeverity(String(17))).toBe(false); });
  it('isValidSeverity n18', () => { expect(isValidSeverity(String(18))).toBe(false); });
  it('isValidSeverity n19', () => { expect(isValidSeverity(String(19))).toBe(false); });
  it('isValidSeverity n20', () => { expect(isValidSeverity(String(20))).toBe(false); });
  it('isValidSeverity n21', () => { expect(isValidSeverity(String(21))).toBe(false); });
  it('isValidSeverity n22', () => { expect(isValidSeverity(String(22))).toBe(false); });
  it('isValidSeverity n23', () => { expect(isValidSeverity(String(23))).toBe(false); });
  it('isValidSeverity n24', () => { expect(isValidSeverity(String(24))).toBe(false); });
  it('isValidSeverity n25', () => { expect(isValidSeverity(String(25))).toBe(false); });
  it('isValidSeverity n26', () => { expect(isValidSeverity(String(26))).toBe(false); });
  it('isValidSeverity n27', () => { expect(isValidSeverity(String(27))).toBe(false); });
  it('isValidSeverity n28', () => { expect(isValidSeverity(String(28))).toBe(false); });
  it('isValidSeverity n29', () => { expect(isValidSeverity(String(29))).toBe(false); });
  it('isValidSeverity n30', () => { expect(isValidSeverity(String(30))).toBe(false); });
  it('isValidSeverity n31', () => { expect(isValidSeverity(String(31))).toBe(false); });
  it('isValidSeverity n32', () => { expect(isValidSeverity(String(32))).toBe(false); });
  it('isValidSeverity n33', () => { expect(isValidSeverity(String(33))).toBe(false); });
  it('isValidSeverity n34', () => { expect(isValidSeverity(String(34))).toBe(false); });
  it('isValidSeverity n35', () => { expect(isValidSeverity(String(35))).toBe(false); });
  it('isValidSeverity n36', () => { expect(isValidSeverity(String(36))).toBe(false); });
  it('isValidSeverity n37', () => { expect(isValidSeverity(String(37))).toBe(false); });
  it('isValidSeverity n38', () => { expect(isValidSeverity(String(38))).toBe(false); });
  it('isValidSeverity n39', () => { expect(isValidSeverity(String(39))).toBe(false); });
  it('isValidSeverity n40', () => { expect(isValidSeverity(String(40))).toBe(false); });
  it('isValidSeverity n41', () => { expect(isValidSeverity(String(41))).toBe(false); });
  it('isValidSeverity n42', () => { expect(isValidSeverity(String(42))).toBe(false); });
  it('isValidSeverity n43', () => { expect(isValidSeverity(String(43))).toBe(false); });
  it('isValidSeverity n44', () => { expect(isValidSeverity(String(44))).toBe(false); });
  it('isValidSeverity n45', () => { expect(isValidSeverity(String(45))).toBe(false); });
  it('isValidSeverity n46', () => { expect(isValidSeverity(String(46))).toBe(false); });
  it('isValidSeverity n47', () => { expect(isValidSeverity(String(47))).toBe(false); });
  it('isValidSeverity n48', () => { expect(isValidSeverity(String(48))).toBe(false); });
  it('isValidSeverity n49', () => { expect(isValidSeverity(String(49))).toBe(false); });
});

describe('isValidStandard', () => {
  standards.forEach(s => { it('valid std: ' + s, () => { expect(isValidStandard(s)).toBe(true); }); });
  invStd.forEach(s => { it('invalid std: ' + s, () => { expect(isValidStandard(s)).toBe(false); }); });
  it('isValidStandard rejects std_0', () => { expect(isValidStandard('std_0')).toBe(false); });
  it('isValidStandard rejects std_1', () => { expect(isValidStandard('std_1')).toBe(false); });
  it('isValidStandard rejects std_2', () => { expect(isValidStandard('std_2')).toBe(false); });
  it('isValidStandard rejects std_3', () => { expect(isValidStandard('std_3')).toBe(false); });
  it('isValidStandard rejects std_4', () => { expect(isValidStandard('std_4')).toBe(false); });
  it('isValidStandard rejects std_5', () => { expect(isValidStandard('std_5')).toBe(false); });
  it('isValidStandard rejects std_6', () => { expect(isValidStandard('std_6')).toBe(false); });
  it('isValidStandard rejects std_7', () => { expect(isValidStandard('std_7')).toBe(false); });
  it('isValidStandard rejects std_8', () => { expect(isValidStandard('std_8')).toBe(false); });
  it('isValidStandard rejects std_9', () => { expect(isValidStandard('std_9')).toBe(false); });
  it('isValidStandard rejects std_10', () => { expect(isValidStandard('std_10')).toBe(false); });
  it('isValidStandard rejects std_11', () => { expect(isValidStandard('std_11')).toBe(false); });
  it('isValidStandard rejects std_12', () => { expect(isValidStandard('std_12')).toBe(false); });
  it('isValidStandard rejects std_13', () => { expect(isValidStandard('std_13')).toBe(false); });
  it('isValidStandard rejects std_14', () => { expect(isValidStandard('std_14')).toBe(false); });
  it('isValidStandard rejects std_15', () => { expect(isValidStandard('std_15')).toBe(false); });
  it('isValidStandard rejects std_16', () => { expect(isValidStandard('std_16')).toBe(false); });
  it('isValidStandard rejects std_17', () => { expect(isValidStandard('std_17')).toBe(false); });
  it('isValidStandard rejects std_18', () => { expect(isValidStandard('std_18')).toBe(false); });
  it('isValidStandard rejects std_19', () => { expect(isValidStandard('std_19')).toBe(false); });
  it('isValidStandard rejects std_20', () => { expect(isValidStandard('std_20')).toBe(false); });
  it('isValidStandard rejects std_21', () => { expect(isValidStandard('std_21')).toBe(false); });
  it('isValidStandard rejects std_22', () => { expect(isValidStandard('std_22')).toBe(false); });
  it('isValidStandard rejects std_23', () => { expect(isValidStandard('std_23')).toBe(false); });
  it('isValidStandard rejects std_24', () => { expect(isValidStandard('std_24')).toBe(false); });
  it('isValidStandard rejects std_25', () => { expect(isValidStandard('std_25')).toBe(false); });
  it('isValidStandard rejects std_26', () => { expect(isValidStandard('std_26')).toBe(false); });
  it('isValidStandard rejects std_27', () => { expect(isValidStandard('std_27')).toBe(false); });
  it('isValidStandard rejects std_28', () => { expect(isValidStandard('std_28')).toBe(false); });
  it('isValidStandard rejects std_29', () => { expect(isValidStandard('std_29')).toBe(false); });
  it('isValidStandard rejects std_30', () => { expect(isValidStandard('std_30')).toBe(false); });
  it('isValidStandard rejects std_31', () => { expect(isValidStandard('std_31')).toBe(false); });
  it('isValidStandard rejects std_32', () => { expect(isValidStandard('std_32')).toBe(false); });
  it('isValidStandard rejects std_33', () => { expect(isValidStandard('std_33')).toBe(false); });
  it('isValidStandard rejects std_34', () => { expect(isValidStandard('std_34')).toBe(false); });
  it('isValidStandard rejects std_35', () => { expect(isValidStandard('std_35')).toBe(false); });
  it('isValidStandard rejects std_36', () => { expect(isValidStandard('std_36')).toBe(false); });
  it('isValidStandard rejects std_37', () => { expect(isValidStandard('std_37')).toBe(false); });
  it('isValidStandard rejects std_38', () => { expect(isValidStandard('std_38')).toBe(false); });
  it('isValidStandard rejects std_39', () => { expect(isValidStandard('std_39')).toBe(false); });
  it('isValidStandard rejects std_40', () => { expect(isValidStandard('std_40')).toBe(false); });
  it('isValidStandard rejects std_41', () => { expect(isValidStandard('std_41')).toBe(false); });
  it('isValidStandard rejects std_42', () => { expect(isValidStandard('std_42')).toBe(false); });
  it('isValidStandard rejects std_43', () => { expect(isValidStandard('std_43')).toBe(false); });
  it('isValidStandard rejects std_44', () => { expect(isValidStandard('std_44')).toBe(false); });
  it('isValidStandard rejects std_45', () => { expect(isValidStandard('std_45')).toBe(false); });
  it('isValidStandard rejects std_46', () => { expect(isValidStandard('std_46')).toBe(false); });
  it('isValidStandard rejects std_47', () => { expect(isValidStandard('std_47')).toBe(false); });
  it('isValidStandard rejects std_48', () => { expect(isValidStandard('std_48')).toBe(false); });
  it('isValidStandard rejects std_49', () => { expect(isValidStandard('std_49')).toBe(false); });
  it('isValidStandard n0', () => { expect(isValidStandard(String(0))).toBe(false); });
  it('isValidStandard n1', () => { expect(isValidStandard(String(1))).toBe(false); });
  it('isValidStandard n2', () => { expect(isValidStandard(String(2))).toBe(false); });
  it('isValidStandard n3', () => { expect(isValidStandard(String(3))).toBe(false); });
  it('isValidStandard n4', () => { expect(isValidStandard(String(4))).toBe(false); });
  it('isValidStandard n5', () => { expect(isValidStandard(String(5))).toBe(false); });
  it('isValidStandard n6', () => { expect(isValidStandard(String(6))).toBe(false); });
  it('isValidStandard n7', () => { expect(isValidStandard(String(7))).toBe(false); });
  it('isValidStandard n8', () => { expect(isValidStandard(String(8))).toBe(false); });
  it('isValidStandard n9', () => { expect(isValidStandard(String(9))).toBe(false); });
  it('isValidStandard n10', () => { expect(isValidStandard(String(10))).toBe(false); });
  it('isValidStandard n11', () => { expect(isValidStandard(String(11))).toBe(false); });
  it('isValidStandard n12', () => { expect(isValidStandard(String(12))).toBe(false); });
  it('isValidStandard n13', () => { expect(isValidStandard(String(13))).toBe(false); });
  it('isValidStandard n14', () => { expect(isValidStandard(String(14))).toBe(false); });
  it('isValidStandard n15', () => { expect(isValidStandard(String(15))).toBe(false); });
  it('isValidStandard n16', () => { expect(isValidStandard(String(16))).toBe(false); });
  it('isValidStandard n17', () => { expect(isValidStandard(String(17))).toBe(false); });
  it('isValidStandard n18', () => { expect(isValidStandard(String(18))).toBe(false); });
  it('isValidStandard n19', () => { expect(isValidStandard(String(19))).toBe(false); });
  it('isValidStandard n20', () => { expect(isValidStandard(String(20))).toBe(false); });
  it('isValidStandard n21', () => { expect(isValidStandard(String(21))).toBe(false); });
  it('isValidStandard n22', () => { expect(isValidStandard(String(22))).toBe(false); });
  it('isValidStandard n23', () => { expect(isValidStandard(String(23))).toBe(false); });
  it('isValidStandard n24', () => { expect(isValidStandard(String(24))).toBe(false); });
  it('isValidStandard n25', () => { expect(isValidStandard(String(25))).toBe(false); });
  it('isValidStandard n26', () => { expect(isValidStandard(String(26))).toBe(false); });
  it('isValidStandard n27', () => { expect(isValidStandard(String(27))).toBe(false); });
  it('isValidStandard n28', () => { expect(isValidStandard(String(28))).toBe(false); });
  it('isValidStandard n29', () => { expect(isValidStandard(String(29))).toBe(false); });
  it('isValidStandard n30', () => { expect(isValidStandard(String(30))).toBe(false); });
  it('isValidStandard n31', () => { expect(isValidStandard(String(31))).toBe(false); });
  it('isValidStandard n32', () => { expect(isValidStandard(String(32))).toBe(false); });
  it('isValidStandard n33', () => { expect(isValidStandard(String(33))).toBe(false); });
  it('isValidStandard n34', () => { expect(isValidStandard(String(34))).toBe(false); });
  it('isValidStandard n35', () => { expect(isValidStandard(String(35))).toBe(false); });
  it('isValidStandard n36', () => { expect(isValidStandard(String(36))).toBe(false); });
  it('isValidStandard n37', () => { expect(isValidStandard(String(37))).toBe(false); });
  it('isValidStandard n38', () => { expect(isValidStandard(String(38))).toBe(false); });
  it('isValidStandard n39', () => { expect(isValidStandard(String(39))).toBe(false); });
  it('isValidStandard n40', () => { expect(isValidStandard(String(40))).toBe(false); });
  it('isValidStandard n41', () => { expect(isValidStandard(String(41))).toBe(false); });
  it('isValidStandard n42', () => { expect(isValidStandard(String(42))).toBe(false); });
  it('isValidStandard n43', () => { expect(isValidStandard(String(43))).toBe(false); });
  it('isValidStandard n44', () => { expect(isValidStandard(String(44))).toBe(false); });
  it('isValidStandard n45', () => { expect(isValidStandard(String(45))).toBe(false); });
  it('isValidStandard n46', () => { expect(isValidStandard(String(46))).toBe(false); });
  it('isValidStandard n47', () => { expect(isValidStandard(String(47))).toBe(false); });
  it('isValidStandard n48', () => { expect(isValidStandard(String(48))).toBe(false); });
  it('isValidStandard n49', () => { expect(isValidStandard(String(49))).toBe(false); });
});

describe('scoreLabel', () => {
  it('score 100 Excellent', () => { expect(scoreLabel(100)).toBe('Excellent'); });
  it('score 95 Excellent', () => { expect(scoreLabel(95)).toBe('Excellent'); });
  it('score 90 Excellent', () => { expect(scoreLabel(90)).toBe('Excellent'); });
  it('score 89 Good', () => { expect(scoreLabel(89)).toBe('Good'); });
  it('score 80 Good', () => { expect(scoreLabel(80)).toBe('Good'); });
  it('score 75 Good', () => { expect(scoreLabel(75)).toBe('Good'); });
  it('score 74 Acceptable', () => { expect(scoreLabel(74)).toBe('Acceptable'); });
  it('score 65 Acceptable', () => { expect(scoreLabel(65)).toBe('Acceptable'); });
  it('score 60 Acceptable', () => { expect(scoreLabel(60)).toBe('Acceptable'); });
  it('score 59 Poor', () => { expect(scoreLabel(59)).toBe('Poor'); });
  it('score 50 Poor', () => { expect(scoreLabel(50)).toBe('Poor'); });
  it('score 40 Poor', () => { expect(scoreLabel(40)).toBe('Poor'); });
  it('score 39 Critical', () => { expect(scoreLabel(39)).toBe('Critical'); });
  it('score 20 Critical', () => { expect(scoreLabel(20)).toBe('Critical'); });
  it('score 0 Critical', () => { expect(scoreLabel(0)).toBe('Critical'); });
  it('score 90 Excellent', () => { expect(scoreLabel(90)).toBe('Excellent'); });
  it('score 91 Excellent', () => { expect(scoreLabel(91)).toBe('Excellent'); });
  it('score 92 Excellent', () => { expect(scoreLabel(92)).toBe('Excellent'); });
  it('score 93 Excellent', () => { expect(scoreLabel(93)).toBe('Excellent'); });
  it('score 94 Excellent', () => { expect(scoreLabel(94)).toBe('Excellent'); });
  it('score 95 Excellent', () => { expect(scoreLabel(95)).toBe('Excellent'); });
  it('score 96 Excellent', () => { expect(scoreLabel(96)).toBe('Excellent'); });
  it('score 97 Excellent', () => { expect(scoreLabel(97)).toBe('Excellent'); });
  it('score 98 Excellent', () => { expect(scoreLabel(98)).toBe('Excellent'); });
  it('score 99 Excellent', () => { expect(scoreLabel(99)).toBe('Excellent'); });
  it('score 100 Excellent', () => { expect(scoreLabel(100)).toBe('Excellent'); });
  it('score 75 Good', () => { expect(scoreLabel(75)).toBe('Good'); });
  it('score 76 Good', () => { expect(scoreLabel(76)).toBe('Good'); });
  it('score 77 Good', () => { expect(scoreLabel(77)).toBe('Good'); });
  it('score 78 Good', () => { expect(scoreLabel(78)).toBe('Good'); });
  it('score 79 Good', () => { expect(scoreLabel(79)).toBe('Good'); });
  it('score 80 Good', () => { expect(scoreLabel(80)).toBe('Good'); });
  it('score 81 Good', () => { expect(scoreLabel(81)).toBe('Good'); });
  it('score 82 Good', () => { expect(scoreLabel(82)).toBe('Good'); });
  it('score 83 Good', () => { expect(scoreLabel(83)).toBe('Good'); });
  it('score 84 Good', () => { expect(scoreLabel(84)).toBe('Good'); });
  it('score 85 Good', () => { expect(scoreLabel(85)).toBe('Good'); });
  it('score 86 Good', () => { expect(scoreLabel(86)).toBe('Good'); });
  it('score 87 Good', () => { expect(scoreLabel(87)).toBe('Good'); });
  it('score 88 Good', () => { expect(scoreLabel(88)).toBe('Good'); });
  it('score 89 Good', () => { expect(scoreLabel(89)).toBe('Good'); });
  it('score 60 Acceptable', () => { expect(scoreLabel(60)).toBe('Acceptable'); });
  it('score 61 Acceptable', () => { expect(scoreLabel(61)).toBe('Acceptable'); });
  it('score 62 Acceptable', () => { expect(scoreLabel(62)).toBe('Acceptable'); });
  it('score 63 Acceptable', () => { expect(scoreLabel(63)).toBe('Acceptable'); });
  it('score 64 Acceptable', () => { expect(scoreLabel(64)).toBe('Acceptable'); });
  it('score 65 Acceptable', () => { expect(scoreLabel(65)).toBe('Acceptable'); });
  it('score 66 Acceptable', () => { expect(scoreLabel(66)).toBe('Acceptable'); });
  it('score 67 Acceptable', () => { expect(scoreLabel(67)).toBe('Acceptable'); });
  it('score 68 Acceptable', () => { expect(scoreLabel(68)).toBe('Acceptable'); });
  it('score 69 Acceptable', () => { expect(scoreLabel(69)).toBe('Acceptable'); });
  it('score 70 Acceptable', () => { expect(scoreLabel(70)).toBe('Acceptable'); });
  it('score 71 Acceptable', () => { expect(scoreLabel(71)).toBe('Acceptable'); });
  it('score 72 Acceptable', () => { expect(scoreLabel(72)).toBe('Acceptable'); });
  it('score 73 Acceptable', () => { expect(scoreLabel(73)).toBe('Acceptable'); });
  it('score 74 Acceptable', () => { expect(scoreLabel(74)).toBe('Acceptable'); });
  it('score 40 Poor', () => { expect(scoreLabel(40)).toBe('Poor'); });
  it('score 41 Poor', () => { expect(scoreLabel(41)).toBe('Poor'); });
  it('score 42 Poor', () => { expect(scoreLabel(42)).toBe('Poor'); });
  it('score 43 Poor', () => { expect(scoreLabel(43)).toBe('Poor'); });
  it('score 44 Poor', () => { expect(scoreLabel(44)).toBe('Poor'); });
  it('score 45 Poor', () => { expect(scoreLabel(45)).toBe('Poor'); });
  it('score 46 Poor', () => { expect(scoreLabel(46)).toBe('Poor'); });
  it('score 47 Poor', () => { expect(scoreLabel(47)).toBe('Poor'); });
  it('score 48 Poor', () => { expect(scoreLabel(48)).toBe('Poor'); });
  it('score 49 Poor', () => { expect(scoreLabel(49)).toBe('Poor'); });
  it('score 50 Poor', () => { expect(scoreLabel(50)).toBe('Poor'); });
  it('score 51 Poor', () => { expect(scoreLabel(51)).toBe('Poor'); });
  it('score 52 Poor', () => { expect(scoreLabel(52)).toBe('Poor'); });
  it('score 53 Poor', () => { expect(scoreLabel(53)).toBe('Poor'); });
  it('score 54 Poor', () => { expect(scoreLabel(54)).toBe('Poor'); });
  it('score 55 Poor', () => { expect(scoreLabel(55)).toBe('Poor'); });
  it('score 56 Poor', () => { expect(scoreLabel(56)).toBe('Poor'); });
  it('score 57 Poor', () => { expect(scoreLabel(57)).toBe('Poor'); });
  it('score 58 Poor', () => { expect(scoreLabel(58)).toBe('Poor'); });
  it('score 59 Poor', () => { expect(scoreLabel(59)).toBe('Poor'); });
  it('score 0 Critical', () => { expect(scoreLabel(0)).toBe('Critical'); });
  it('score 1 Critical', () => { expect(scoreLabel(1)).toBe('Critical'); });
  it('score 2 Critical', () => { expect(scoreLabel(2)).toBe('Critical'); });
  it('score 3 Critical', () => { expect(scoreLabel(3)).toBe('Critical'); });
  it('score 4 Critical', () => { expect(scoreLabel(4)).toBe('Critical'); });
  it('score 5 Critical', () => { expect(scoreLabel(5)).toBe('Critical'); });
  it('score 6 Critical', () => { expect(scoreLabel(6)).toBe('Critical'); });
  it('score 7 Critical', () => { expect(scoreLabel(7)).toBe('Critical'); });
  it('score 8 Critical', () => { expect(scoreLabel(8)).toBe('Critical'); });
  it('score 9 Critical', () => { expect(scoreLabel(9)).toBe('Critical'); });
  it('score 10 Critical', () => { expect(scoreLabel(10)).toBe('Critical'); });
  it('score 11 Critical', () => { expect(scoreLabel(11)).toBe('Critical'); });
  it('score 12 Critical', () => { expect(scoreLabel(12)).toBe('Critical'); });
  it('score 13 Critical', () => { expect(scoreLabel(13)).toBe('Critical'); });
  it('score 14 Critical', () => { expect(scoreLabel(14)).toBe('Critical'); });
  it('score 15 Critical', () => { expect(scoreLabel(15)).toBe('Critical'); });
  it('score 16 Critical', () => { expect(scoreLabel(16)).toBe('Critical'); });
  it('score 17 Critical', () => { expect(scoreLabel(17)).toBe('Critical'); });
  it('score 18 Critical', () => { expect(scoreLabel(18)).toBe('Critical'); });
  it('score 19 Critical', () => { expect(scoreLabel(19)).toBe('Critical'); });
  it('score 20 Critical', () => { expect(scoreLabel(20)).toBe('Critical'); });
  it('score 21 Critical', () => { expect(scoreLabel(21)).toBe('Critical'); });
  it('score 22 Critical', () => { expect(scoreLabel(22)).toBe('Critical'); });
  it('score 23 Critical', () => { expect(scoreLabel(23)).toBe('Critical'); });
  it('score 24 Critical', () => { expect(scoreLabel(24)).toBe('Critical'); });
  it('score 25 Critical', () => { expect(scoreLabel(25)).toBe('Critical'); });
  it('score 26 Critical', () => { expect(scoreLabel(26)).toBe('Critical'); });
  it('score 27 Critical', () => { expect(scoreLabel(27)).toBe('Critical'); });
  it('score 28 Critical', () => { expect(scoreLabel(28)).toBe('Critical'); });
  it('score 29 Critical', () => { expect(scoreLabel(29)).toBe('Critical'); });
  it('score 30 Critical', () => { expect(scoreLabel(30)).toBe('Critical'); });
  it('score 31 Critical', () => { expect(scoreLabel(31)).toBe('Critical'); });
  it('score 32 Critical', () => { expect(scoreLabel(32)).toBe('Critical'); });
  it('score 33 Critical', () => { expect(scoreLabel(33)).toBe('Critical'); });
  it('score 34 Critical', () => { expect(scoreLabel(34)).toBe('Critical'); });
  it('score 35 Critical', () => { expect(scoreLabel(35)).toBe('Critical'); });
  it('score 36 Critical', () => { expect(scoreLabel(36)).toBe('Critical'); });
  it('score 37 Critical', () => { expect(scoreLabel(37)).toBe('Critical'); });
  it('score 38 Critical', () => { expect(scoreLabel(38)).toBe('Critical'); });
  it('score 39 Critical', () => { expect(scoreLabel(39)).toBe('Critical'); });
});

describe('makeContext', () => {
  it('makeContext 0', () => {
    const ctx = makeContext('type_0', 'id_0', { value: 0 });
    expect(ctx.entityType).toBe('type_0');
    expect(ctx.entityId).toBe('id_0');
    expect(ctx.data).toEqual({ value: 0 });
  });
  it('makeContext 1', () => {
    const ctx = makeContext('type_1', 'id_1', { value: 1 });
    expect(ctx.entityType).toBe('type_1');
    expect(ctx.entityId).toBe('id_1');
    expect(ctx.data).toEqual({ value: 1 });
  });
  it('makeContext 2', () => {
    const ctx = makeContext('type_2', 'id_2', { value: 2 });
    expect(ctx.entityType).toBe('type_2');
    expect(ctx.entityId).toBe('id_2');
    expect(ctx.data).toEqual({ value: 2 });
  });
  it('makeContext 3', () => {
    const ctx = makeContext('type_3', 'id_3', { value: 3 });
    expect(ctx.entityType).toBe('type_3');
    expect(ctx.entityId).toBe('id_3');
    expect(ctx.data).toEqual({ value: 3 });
  });
  it('makeContext 4', () => {
    const ctx = makeContext('type_4', 'id_4', { value: 4 });
    expect(ctx.entityType).toBe('type_4');
    expect(ctx.entityId).toBe('id_4');
    expect(ctx.data).toEqual({ value: 4 });
  });
  it('makeContext 5', () => {
    const ctx = makeContext('type_5', 'id_5', { value: 5 });
    expect(ctx.entityType).toBe('type_5');
    expect(ctx.entityId).toBe('id_5');
    expect(ctx.data).toEqual({ value: 5 });
  });
  it('makeContext 6', () => {
    const ctx = makeContext('type_6', 'id_6', { value: 6 });
    expect(ctx.entityType).toBe('type_6');
    expect(ctx.entityId).toBe('id_6');
    expect(ctx.data).toEqual({ value: 6 });
  });
  it('makeContext 7', () => {
    const ctx = makeContext('type_7', 'id_7', { value: 7 });
    expect(ctx.entityType).toBe('type_7');
    expect(ctx.entityId).toBe('id_7');
    expect(ctx.data).toEqual({ value: 7 });
  });
  it('makeContext 8', () => {
    const ctx = makeContext('type_8', 'id_8', { value: 8 });
    expect(ctx.entityType).toBe('type_8');
    expect(ctx.entityId).toBe('id_8');
    expect(ctx.data).toEqual({ value: 8 });
  });
  it('makeContext 9', () => {
    const ctx = makeContext('type_9', 'id_9', { value: 9 });
    expect(ctx.entityType).toBe('type_9');
    expect(ctx.entityId).toBe('id_9');
    expect(ctx.data).toEqual({ value: 9 });
  });
  it('makeContext 10', () => {
    const ctx = makeContext('type_10', 'id_10', { value: 10 });
    expect(ctx.entityType).toBe('type_10');
    expect(ctx.entityId).toBe('id_10');
    expect(ctx.data).toEqual({ value: 10 });
  });
  it('makeContext 11', () => {
    const ctx = makeContext('type_11', 'id_11', { value: 11 });
    expect(ctx.entityType).toBe('type_11');
    expect(ctx.entityId).toBe('id_11');
    expect(ctx.data).toEqual({ value: 11 });
  });
  it('makeContext 12', () => {
    const ctx = makeContext('type_12', 'id_12', { value: 12 });
    expect(ctx.entityType).toBe('type_12');
    expect(ctx.entityId).toBe('id_12');
    expect(ctx.data).toEqual({ value: 12 });
  });
  it('makeContext 13', () => {
    const ctx = makeContext('type_13', 'id_13', { value: 13 });
    expect(ctx.entityType).toBe('type_13');
    expect(ctx.entityId).toBe('id_13');
    expect(ctx.data).toEqual({ value: 13 });
  });
  it('makeContext 14', () => {
    const ctx = makeContext('type_14', 'id_14', { value: 14 });
    expect(ctx.entityType).toBe('type_14');
    expect(ctx.entityId).toBe('id_14');
    expect(ctx.data).toEqual({ value: 14 });
  });
  it('makeContext 15', () => {
    const ctx = makeContext('type_15', 'id_15', { value: 15 });
    expect(ctx.entityType).toBe('type_15');
    expect(ctx.entityId).toBe('id_15');
    expect(ctx.data).toEqual({ value: 15 });
  });
  it('makeContext 16', () => {
    const ctx = makeContext('type_16', 'id_16', { value: 16 });
    expect(ctx.entityType).toBe('type_16');
    expect(ctx.entityId).toBe('id_16');
    expect(ctx.data).toEqual({ value: 16 });
  });
  it('makeContext 17', () => {
    const ctx = makeContext('type_17', 'id_17', { value: 17 });
    expect(ctx.entityType).toBe('type_17');
    expect(ctx.entityId).toBe('id_17');
    expect(ctx.data).toEqual({ value: 17 });
  });
  it('makeContext 18', () => {
    const ctx = makeContext('type_18', 'id_18', { value: 18 });
    expect(ctx.entityType).toBe('type_18');
    expect(ctx.entityId).toBe('id_18');
    expect(ctx.data).toEqual({ value: 18 });
  });
  it('makeContext 19', () => {
    const ctx = makeContext('type_19', 'id_19', { value: 19 });
    expect(ctx.entityType).toBe('type_19');
    expect(ctx.entityId).toBe('id_19');
    expect(ctx.data).toEqual({ value: 19 });
  });
  it('makeContext 20', () => {
    const ctx = makeContext('type_20', 'id_20', { value: 20 });
    expect(ctx.entityType).toBe('type_20');
    expect(ctx.entityId).toBe('id_20');
    expect(ctx.data).toEqual({ value: 20 });
  });
  it('makeContext 21', () => {
    const ctx = makeContext('type_21', 'id_21', { value: 21 });
    expect(ctx.entityType).toBe('type_21');
    expect(ctx.entityId).toBe('id_21');
    expect(ctx.data).toEqual({ value: 21 });
  });
  it('makeContext 22', () => {
    const ctx = makeContext('type_22', 'id_22', { value: 22 });
    expect(ctx.entityType).toBe('type_22');
    expect(ctx.entityId).toBe('id_22');
    expect(ctx.data).toEqual({ value: 22 });
  });
  it('makeContext 23', () => {
    const ctx = makeContext('type_23', 'id_23', { value: 23 });
    expect(ctx.entityType).toBe('type_23');
    expect(ctx.entityId).toBe('id_23');
    expect(ctx.data).toEqual({ value: 23 });
  });
  it('makeContext 24', () => {
    const ctx = makeContext('type_24', 'id_24', { value: 24 });
    expect(ctx.entityType).toBe('type_24');
    expect(ctx.entityId).toBe('id_24');
    expect(ctx.data).toEqual({ value: 24 });
  });
  it('makeContext 25', () => {
    const ctx = makeContext('type_25', 'id_25', { value: 25 });
    expect(ctx.entityType).toBe('type_25');
    expect(ctx.entityId).toBe('id_25');
    expect(ctx.data).toEqual({ value: 25 });
  });
  it('makeContext 26', () => {
    const ctx = makeContext('type_26', 'id_26', { value: 26 });
    expect(ctx.entityType).toBe('type_26');
    expect(ctx.entityId).toBe('id_26');
    expect(ctx.data).toEqual({ value: 26 });
  });
  it('makeContext 27', () => {
    const ctx = makeContext('type_27', 'id_27', { value: 27 });
    expect(ctx.entityType).toBe('type_27');
    expect(ctx.entityId).toBe('id_27');
    expect(ctx.data).toEqual({ value: 27 });
  });
  it('makeContext 28', () => {
    const ctx = makeContext('type_28', 'id_28', { value: 28 });
    expect(ctx.entityType).toBe('type_28');
    expect(ctx.entityId).toBe('id_28');
    expect(ctx.data).toEqual({ value: 28 });
  });
  it('makeContext 29', () => {
    const ctx = makeContext('type_29', 'id_29', { value: 29 });
    expect(ctx.entityType).toBe('type_29');
    expect(ctx.entityId).toBe('id_29');
    expect(ctx.data).toEqual({ value: 29 });
  });
  it('makeContext 30', () => {
    const ctx = makeContext('type_30', 'id_30', { value: 30 });
    expect(ctx.entityType).toBe('type_30');
    expect(ctx.entityId).toBe('id_30');
    expect(ctx.data).toEqual({ value: 30 });
  });
  it('makeContext 31', () => {
    const ctx = makeContext('type_31', 'id_31', { value: 31 });
    expect(ctx.entityType).toBe('type_31');
    expect(ctx.entityId).toBe('id_31');
    expect(ctx.data).toEqual({ value: 31 });
  });
  it('makeContext 32', () => {
    const ctx = makeContext('type_32', 'id_32', { value: 32 });
    expect(ctx.entityType).toBe('type_32');
    expect(ctx.entityId).toBe('id_32');
    expect(ctx.data).toEqual({ value: 32 });
  });
  it('makeContext 33', () => {
    const ctx = makeContext('type_33', 'id_33', { value: 33 });
    expect(ctx.entityType).toBe('type_33');
    expect(ctx.entityId).toBe('id_33');
    expect(ctx.data).toEqual({ value: 33 });
  });
  it('makeContext 34', () => {
    const ctx = makeContext('type_34', 'id_34', { value: 34 });
    expect(ctx.entityType).toBe('type_34');
    expect(ctx.entityId).toBe('id_34');
    expect(ctx.data).toEqual({ value: 34 });
  });
  it('makeContext 35', () => {
    const ctx = makeContext('type_35', 'id_35', { value: 35 });
    expect(ctx.entityType).toBe('type_35');
    expect(ctx.entityId).toBe('id_35');
    expect(ctx.data).toEqual({ value: 35 });
  });
  it('makeContext 36', () => {
    const ctx = makeContext('type_36', 'id_36', { value: 36 });
    expect(ctx.entityType).toBe('type_36');
    expect(ctx.entityId).toBe('id_36');
    expect(ctx.data).toEqual({ value: 36 });
  });
  it('makeContext 37', () => {
    const ctx = makeContext('type_37', 'id_37', { value: 37 });
    expect(ctx.entityType).toBe('type_37');
    expect(ctx.entityId).toBe('id_37');
    expect(ctx.data).toEqual({ value: 37 });
  });
  it('makeContext 38', () => {
    const ctx = makeContext('type_38', 'id_38', { value: 38 });
    expect(ctx.entityType).toBe('type_38');
    expect(ctx.entityId).toBe('id_38');
    expect(ctx.data).toEqual({ value: 38 });
  });
  it('makeContext 39', () => {
    const ctx = makeContext('type_39', 'id_39', { value: 39 });
    expect(ctx.entityType).toBe('type_39');
    expect(ctx.entityId).toBe('id_39');
    expect(ctx.data).toEqual({ value: 39 });
  });
  it('makeContext 40', () => {
    const ctx = makeContext('type_40', 'id_40', { value: 40 });
    expect(ctx.entityType).toBe('type_40');
    expect(ctx.entityId).toBe('id_40');
    expect(ctx.data).toEqual({ value: 40 });
  });
  it('makeContext 41', () => {
    const ctx = makeContext('type_41', 'id_41', { value: 41 });
    expect(ctx.entityType).toBe('type_41');
    expect(ctx.entityId).toBe('id_41');
    expect(ctx.data).toEqual({ value: 41 });
  });
  it('makeContext 42', () => {
    const ctx = makeContext('type_42', 'id_42', { value: 42 });
    expect(ctx.entityType).toBe('type_42');
    expect(ctx.entityId).toBe('id_42');
    expect(ctx.data).toEqual({ value: 42 });
  });
  it('makeContext 43', () => {
    const ctx = makeContext('type_43', 'id_43', { value: 43 });
    expect(ctx.entityType).toBe('type_43');
    expect(ctx.entityId).toBe('id_43');
    expect(ctx.data).toEqual({ value: 43 });
  });
  it('makeContext 44', () => {
    const ctx = makeContext('type_44', 'id_44', { value: 44 });
    expect(ctx.entityType).toBe('type_44');
    expect(ctx.entityId).toBe('id_44');
    expect(ctx.data).toEqual({ value: 44 });
  });
  it('makeContext 45', () => {
    const ctx = makeContext('type_45', 'id_45', { value: 45 });
    expect(ctx.entityType).toBe('type_45');
    expect(ctx.entityId).toBe('id_45');
    expect(ctx.data).toEqual({ value: 45 });
  });
  it('makeContext 46', () => {
    const ctx = makeContext('type_46', 'id_46', { value: 46 });
    expect(ctx.entityType).toBe('type_46');
    expect(ctx.entityId).toBe('id_46');
    expect(ctx.data).toEqual({ value: 46 });
  });
  it('makeContext 47', () => {
    const ctx = makeContext('type_47', 'id_47', { value: 47 });
    expect(ctx.entityType).toBe('type_47');
    expect(ctx.entityId).toBe('id_47');
    expect(ctx.data).toEqual({ value: 47 });
  });
  it('makeContext 48', () => {
    const ctx = makeContext('type_48', 'id_48', { value: 48 });
    expect(ctx.entityType).toBe('type_48');
    expect(ctx.entityId).toBe('id_48');
    expect(ctx.data).toEqual({ value: 48 });
  });
  it('makeContext 49', () => {
    const ctx = makeContext('type_49', 'id_49', { value: 49 });
    expect(ctx.entityType).toBe('type_49');
    expect(ctx.entityId).toBe('id_49');
    expect(ctx.data).toEqual({ value: 49 });
  });
  it('metadata undefined', () => { expect(makeContext('d','e',{}).metadata).toBeUndefined(); });
  it('entityType stored', () => { expect(makeContext('incident','i1',{}).entityType).toBe('incident'); });
  it('entityId stored', () => { expect(makeContext('doc','doc-999',{}).entityId).toBe('doc-999'); });
  it('empty data ok', () => { expect(makeContext('t','e',{}).data).toEqual({}); });
  it('returns RuleContext shape', () => {
    const c = makeContext('doc','id1', { n: 5 });
    expect(c.entityType).toBeDefined(); expect(c.entityId).toBeDefined(); expect(c.data).toBeDefined();
  });
});

describe('makeRule', () => {
  it('std=ISO_9001 sev=critical', () => {
    const r = makeRule('r','n','ISO_9001','1','critical', () => true);
    expect(r.standard).toBe('ISO_9001'); expect(r.severity).toBe('critical');
  });
  it('std=ISO_9001 sev=major', () => {
    const r = makeRule('r','n','ISO_9001','1','major', () => true);
    expect(r.standard).toBe('ISO_9001'); expect(r.severity).toBe('major');
  });
  it('std=ISO_9001 sev=minor', () => {
    const r = makeRule('r','n','ISO_9001','1','minor', () => true);
    expect(r.standard).toBe('ISO_9001'); expect(r.severity).toBe('minor');
  });
  it('std=ISO_9001 sev=info', () => {
    const r = makeRule('r','n','ISO_9001','1','info', () => true);
    expect(r.standard).toBe('ISO_9001'); expect(r.severity).toBe('info');
  });
  it('std=ISO_14001 sev=critical', () => {
    const r = makeRule('r','n','ISO_14001','1','critical', () => true);
    expect(r.standard).toBe('ISO_14001'); expect(r.severity).toBe('critical');
  });
  it('std=ISO_14001 sev=major', () => {
    const r = makeRule('r','n','ISO_14001','1','major', () => true);
    expect(r.standard).toBe('ISO_14001'); expect(r.severity).toBe('major');
  });
  it('std=ISO_14001 sev=minor', () => {
    const r = makeRule('r','n','ISO_14001','1','minor', () => true);
    expect(r.standard).toBe('ISO_14001'); expect(r.severity).toBe('minor');
  });
  it('std=ISO_14001 sev=info', () => {
    const r = makeRule('r','n','ISO_14001','1','info', () => true);
    expect(r.standard).toBe('ISO_14001'); expect(r.severity).toBe('info');
  });
  it('std=ISO_45001 sev=critical', () => {
    const r = makeRule('r','n','ISO_45001','1','critical', () => true);
    expect(r.standard).toBe('ISO_45001'); expect(r.severity).toBe('critical');
  });
  it('std=ISO_45001 sev=major', () => {
    const r = makeRule('r','n','ISO_45001','1','major', () => true);
    expect(r.standard).toBe('ISO_45001'); expect(r.severity).toBe('major');
  });
  it('std=ISO_45001 sev=minor', () => {
    const r = makeRule('r','n','ISO_45001','1','minor', () => true);
    expect(r.standard).toBe('ISO_45001'); expect(r.severity).toBe('minor');
  });
  it('std=ISO_45001 sev=info', () => {
    const r = makeRule('r','n','ISO_45001','1','info', () => true);
    expect(r.standard).toBe('ISO_45001'); expect(r.severity).toBe('info');
  });
  it('std=ISO_27001 sev=critical', () => {
    const r = makeRule('r','n','ISO_27001','1','critical', () => true);
    expect(r.standard).toBe('ISO_27001'); expect(r.severity).toBe('critical');
  });
  it('std=ISO_27001 sev=major', () => {
    const r = makeRule('r','n','ISO_27001','1','major', () => true);
    expect(r.standard).toBe('ISO_27001'); expect(r.severity).toBe('major');
  });
  it('std=ISO_27001 sev=minor', () => {
    const r = makeRule('r','n','ISO_27001','1','minor', () => true);
    expect(r.standard).toBe('ISO_27001'); expect(r.severity).toBe('minor');
  });
  it('std=ISO_27001 sev=info', () => {
    const r = makeRule('r','n','ISO_27001','1','info', () => true);
    expect(r.standard).toBe('ISO_27001'); expect(r.severity).toBe('info');
  });
  it('std=GDPR sev=critical', () => {
    const r = makeRule('r','n','GDPR','1','critical', () => true);
    expect(r.standard).toBe('GDPR'); expect(r.severity).toBe('critical');
  });
  it('std=GDPR sev=major', () => {
    const r = makeRule('r','n','GDPR','1','major', () => true);
    expect(r.standard).toBe('GDPR'); expect(r.severity).toBe('major');
  });
  it('std=GDPR sev=minor', () => {
    const r = makeRule('r','n','GDPR','1','minor', () => true);
    expect(r.standard).toBe('GDPR'); expect(r.severity).toBe('minor');
  });
  it('std=GDPR sev=info', () => {
    const r = makeRule('r','n','GDPR','1','info', () => true);
    expect(r.standard).toBe('GDPR'); expect(r.severity).toBe('info');
  });
  it('std=CUSTOM sev=critical', () => {
    const r = makeRule('r','n','CUSTOM','1','critical', () => true);
    expect(r.standard).toBe('CUSTOM'); expect(r.severity).toBe('critical');
  });
  it('std=CUSTOM sev=major', () => {
    const r = makeRule('r','n','CUSTOM','1','major', () => true);
    expect(r.standard).toBe('CUSTOM'); expect(r.severity).toBe('major');
  });
  it('std=CUSTOM sev=minor', () => {
    const r = makeRule('r','n','CUSTOM','1','minor', () => true);
    expect(r.standard).toBe('CUSTOM'); expect(r.severity).toBe('minor');
  });
  it('std=CUSTOM sev=info', () => {
    const r = makeRule('r','n','CUSTOM','1','info', () => true);
    expect(r.standard).toBe('CUSTOM'); expect(r.severity).toBe('info');
  });
  it('id name 0', () => {
    const r = makeRule('rule-0','Name0','CUSTOM','1','minor', () => true);
    expect(r.id).toBe('rule-0'); expect(r.name).toBe('Name0');
  });
  it('id name 1', () => {
    const r = makeRule('rule-1','Name1','CUSTOM','1','minor', () => true);
    expect(r.id).toBe('rule-1'); expect(r.name).toBe('Name1');
  });
  it('id name 2', () => {
    const r = makeRule('rule-2','Name2','CUSTOM','1','minor', () => true);
    expect(r.id).toBe('rule-2'); expect(r.name).toBe('Name2');
  });
  it('id name 3', () => {
    const r = makeRule('rule-3','Name3','CUSTOM','1','minor', () => true);
    expect(r.id).toBe('rule-3'); expect(r.name).toBe('Name3');
  });
  it('id name 4', () => {
    const r = makeRule('rule-4','Name4','CUSTOM','1','minor', () => true);
    expect(r.id).toBe('rule-4'); expect(r.name).toBe('Name4');
  });
  it('id name 5', () => {
    const r = makeRule('rule-5','Name5','CUSTOM','1','minor', () => true);
    expect(r.id).toBe('rule-5'); expect(r.name).toBe('Name5');
  });
  it('id name 6', () => {
    const r = makeRule('rule-6','Name6','CUSTOM','1','minor', () => true);
    expect(r.id).toBe('rule-6'); expect(r.name).toBe('Name6');
  });
  it('id name 7', () => {
    const r = makeRule('rule-7','Name7','CUSTOM','1','minor', () => true);
    expect(r.id).toBe('rule-7'); expect(r.name).toBe('Name7');
  });
  it('id name 8', () => {
    const r = makeRule('rule-8','Name8','CUSTOM','1','minor', () => true);
    expect(r.id).toBe('rule-8'); expect(r.name).toBe('Name8');
  });
  it('id name 9', () => {
    const r = makeRule('rule-9','Name9','CUSTOM','1','minor', () => true);
    expect(r.id).toBe('rule-9'); expect(r.name).toBe('Name9');
  });
  it('id name 10', () => {
    const r = makeRule('rule-10','Name10','CUSTOM','1','minor', () => true);
    expect(r.id).toBe('rule-10'); expect(r.name).toBe('Name10');
  });
  it('id name 11', () => {
    const r = makeRule('rule-11','Name11','CUSTOM','1','minor', () => true);
    expect(r.id).toBe('rule-11'); expect(r.name).toBe('Name11');
  });
  it('id name 12', () => {
    const r = makeRule('rule-12','Name12','CUSTOM','1','minor', () => true);
    expect(r.id).toBe('rule-12'); expect(r.name).toBe('Name12');
  });
  it('id name 13', () => {
    const r = makeRule('rule-13','Name13','CUSTOM','1','minor', () => true);
    expect(r.id).toBe('rule-13'); expect(r.name).toBe('Name13');
  });
  it('id name 14', () => {
    const r = makeRule('rule-14','Name14','CUSTOM','1','minor', () => true);
    expect(r.id).toBe('rule-14'); expect(r.name).toBe('Name14');
  });
  it('id name 15', () => {
    const r = makeRule('rule-15','Name15','CUSTOM','1','minor', () => true);
    expect(r.id).toBe('rule-15'); expect(r.name).toBe('Name15');
  });
  it('id name 16', () => {
    const r = makeRule('rule-16','Name16','CUSTOM','1','minor', () => true);
    expect(r.id).toBe('rule-16'); expect(r.name).toBe('Name16');
  });
  it('id name 17', () => {
    const r = makeRule('rule-17','Name17','CUSTOM','1','minor', () => true);
    expect(r.id).toBe('rule-17'); expect(r.name).toBe('Name17');
  });
  it('id name 18', () => {
    const r = makeRule('rule-18','Name18','CUSTOM','1','minor', () => true);
    expect(r.id).toBe('rule-18'); expect(r.name).toBe('Name18');
  });
  it('id name 19', () => {
    const r = makeRule('rule-19','Name19','CUSTOM','1','minor', () => true);
    expect(r.id).toBe('rule-19'); expect(r.name).toBe('Name19');
  });
  it('id name 20', () => {
    const r = makeRule('rule-20','Name20','CUSTOM','1','minor', () => true);
    expect(r.id).toBe('rule-20'); expect(r.name).toBe('Name20');
  });
  it('id name 21', () => {
    const r = makeRule('rule-21','Name21','CUSTOM','1','minor', () => true);
    expect(r.id).toBe('rule-21'); expect(r.name).toBe('Name21');
  });
  it('id name 22', () => {
    const r = makeRule('rule-22','Name22','CUSTOM','1','minor', () => true);
    expect(r.id).toBe('rule-22'); expect(r.name).toBe('Name22');
  });
  it('id name 23', () => {
    const r = makeRule('rule-23','Name23','CUSTOM','1','minor', () => true);
    expect(r.id).toBe('rule-23'); expect(r.name).toBe('Name23');
  });
  it('id name 24', () => {
    const r = makeRule('rule-24','Name24','CUSTOM','1','minor', () => true);
    expect(r.id).toBe('rule-24'); expect(r.name).toBe('Name24');
  });
  it('id name 25', () => {
    const r = makeRule('rule-25','Name25','CUSTOM','1','minor', () => true);
    expect(r.id).toBe('rule-25'); expect(r.name).toBe('Name25');
  });
  it('id name 26', () => {
    const r = makeRule('rule-26','Name26','CUSTOM','1','minor', () => true);
    expect(r.id).toBe('rule-26'); expect(r.name).toBe('Name26');
  });
  it('id name 27', () => {
    const r = makeRule('rule-27','Name27','CUSTOM','1','minor', () => true);
    expect(r.id).toBe('rule-27'); expect(r.name).toBe('Name27');
  });
  it('id name 28', () => {
    const r = makeRule('rule-28','Name28','CUSTOM','1','minor', () => true);
    expect(r.id).toBe('rule-28'); expect(r.name).toBe('Name28');
  });
  it('id name 29', () => {
    const r = makeRule('rule-29','Name29','CUSTOM','1','minor', () => true);
    expect(r.id).toBe('rule-29'); expect(r.name).toBe('Name29');
  });
  it('id name 30', () => {
    const r = makeRule('rule-30','Name30','CUSTOM','1','minor', () => true);
    expect(r.id).toBe('rule-30'); expect(r.name).toBe('Name30');
  });
  it('id name 31', () => {
    const r = makeRule('rule-31','Name31','CUSTOM','1','minor', () => true);
    expect(r.id).toBe('rule-31'); expect(r.name).toBe('Name31');
  });
  it('id name 32', () => {
    const r = makeRule('rule-32','Name32','CUSTOM','1','minor', () => true);
    expect(r.id).toBe('rule-32'); expect(r.name).toBe('Name32');
  });
  it('id name 33', () => {
    const r = makeRule('rule-33','Name33','CUSTOM','1','minor', () => true);
    expect(r.id).toBe('rule-33'); expect(r.name).toBe('Name33');
  });
  it('id name 34', () => {
    const r = makeRule('rule-34','Name34','CUSTOM','1','minor', () => true);
    expect(r.id).toBe('rule-34'); expect(r.name).toBe('Name34');
  });
  it('id name 35', () => {
    const r = makeRule('rule-35','Name35','CUSTOM','1','minor', () => true);
    expect(r.id).toBe('rule-35'); expect(r.name).toBe('Name35');
  });
  it('id name 36', () => {
    const r = makeRule('rule-36','Name36','CUSTOM','1','minor', () => true);
    expect(r.id).toBe('rule-36'); expect(r.name).toBe('Name36');
  });
  it('id name 37', () => {
    const r = makeRule('rule-37','Name37','CUSTOM','1','minor', () => true);
    expect(r.id).toBe('rule-37'); expect(r.name).toBe('Name37');
  });
  it('id name 38', () => {
    const r = makeRule('rule-38','Name38','CUSTOM','1','minor', () => true);
    expect(r.id).toBe('rule-38'); expect(r.name).toBe('Name38');
  });
  it('id name 39', () => {
    const r = makeRule('rule-39','Name39','CUSTOM','1','minor', () => true);
    expect(r.id).toBe('rule-39'); expect(r.name).toBe('Name39');
  });
  it('mandatory default true', () => {
    expect(makeRule('r','n','CUSTOM','1','minor', () => true).mandatory).toBe(true);
  });
  it('mandatory false', () => {
    expect(makeRule('r','n','CUSTOM','1','minor', () => true, false).mandatory).toBe(false);
  });
  it('clause stored', () => {
    expect(makeRule('r','n','ISO_9001','4.2.3','major', () => false).clause).toBe('4.2.3');
  });
  it('check returns true', () => {
    const r = makeRule('r','n','CUSTOM','1','minor', () => true);
    expect(r.check(makeContext('t','e', {}))).toBe(true);
  });
  it('check returns false', () => {
    const r = makeRule('r','n','CUSTOM','1','minor', () => false);
    expect(r.check(makeContext('t','e', {}))).toBe(false);
  });
});

describe('evaluateRuleSync', () => {
  it('pass sync 0', () => {
    const rule = makeRule('r0','Rule0','CUSTOM','1','minor', () => true);
    const result = evaluateRuleSync(rule, makeContext('doc','d0', {}));
    expect(result.status).toBe('pass');
  });
  it('pass sync 1', () => {
    const rule = makeRule('r1','Rule1','CUSTOM','1','minor', () => true);
    const result = evaluateRuleSync(rule, makeContext('doc','d1', {}));
    expect(result.status).toBe('pass');
  });
  it('pass sync 2', () => {
    const rule = makeRule('r2','Rule2','CUSTOM','1','minor', () => true);
    const result = evaluateRuleSync(rule, makeContext('doc','d2', {}));
    expect(result.status).toBe('pass');
  });
  it('pass sync 3', () => {
    const rule = makeRule('r3','Rule3','CUSTOM','1','minor', () => true);
    const result = evaluateRuleSync(rule, makeContext('doc','d3', {}));
    expect(result.status).toBe('pass');
  });
  it('pass sync 4', () => {
    const rule = makeRule('r4','Rule4','CUSTOM','1','minor', () => true);
    const result = evaluateRuleSync(rule, makeContext('doc','d4', {}));
    expect(result.status).toBe('pass');
  });
  it('pass sync 5', () => {
    const rule = makeRule('r5','Rule5','CUSTOM','1','minor', () => true);
    const result = evaluateRuleSync(rule, makeContext('doc','d5', {}));
    expect(result.status).toBe('pass');
  });
  it('pass sync 6', () => {
    const rule = makeRule('r6','Rule6','CUSTOM','1','minor', () => true);
    const result = evaluateRuleSync(rule, makeContext('doc','d6', {}));
    expect(result.status).toBe('pass');
  });
  it('pass sync 7', () => {
    const rule = makeRule('r7','Rule7','CUSTOM','1','minor', () => true);
    const result = evaluateRuleSync(rule, makeContext('doc','d7', {}));
    expect(result.status).toBe('pass');
  });
  it('pass sync 8', () => {
    const rule = makeRule('r8','Rule8','CUSTOM','1','minor', () => true);
    const result = evaluateRuleSync(rule, makeContext('doc','d8', {}));
    expect(result.status).toBe('pass');
  });
  it('pass sync 9', () => {
    const rule = makeRule('r9','Rule9','CUSTOM','1','minor', () => true);
    const result = evaluateRuleSync(rule, makeContext('doc','d9', {}));
    expect(result.status).toBe('pass');
  });
  it('pass sync 10', () => {
    const rule = makeRule('r10','Rule10','CUSTOM','1','minor', () => true);
    const result = evaluateRuleSync(rule, makeContext('doc','d10', {}));
    expect(result.status).toBe('pass');
  });
  it('pass sync 11', () => {
    const rule = makeRule('r11','Rule11','CUSTOM','1','minor', () => true);
    const result = evaluateRuleSync(rule, makeContext('doc','d11', {}));
    expect(result.status).toBe('pass');
  });
  it('pass sync 12', () => {
    const rule = makeRule('r12','Rule12','CUSTOM','1','minor', () => true);
    const result = evaluateRuleSync(rule, makeContext('doc','d12', {}));
    expect(result.status).toBe('pass');
  });
  it('pass sync 13', () => {
    const rule = makeRule('r13','Rule13','CUSTOM','1','minor', () => true);
    const result = evaluateRuleSync(rule, makeContext('doc','d13', {}));
    expect(result.status).toBe('pass');
  });
  it('pass sync 14', () => {
    const rule = makeRule('r14','Rule14','CUSTOM','1','minor', () => true);
    const result = evaluateRuleSync(rule, makeContext('doc','d14', {}));
    expect(result.status).toBe('pass');
  });
  it('pass sync 15', () => {
    const rule = makeRule('r15','Rule15','CUSTOM','1','minor', () => true);
    const result = evaluateRuleSync(rule, makeContext('doc','d15', {}));
    expect(result.status).toBe('pass');
  });
  it('pass sync 16', () => {
    const rule = makeRule('r16','Rule16','CUSTOM','1','minor', () => true);
    const result = evaluateRuleSync(rule, makeContext('doc','d16', {}));
    expect(result.status).toBe('pass');
  });
  it('pass sync 17', () => {
    const rule = makeRule('r17','Rule17','CUSTOM','1','minor', () => true);
    const result = evaluateRuleSync(rule, makeContext('doc','d17', {}));
    expect(result.status).toBe('pass');
  });
  it('pass sync 18', () => {
    const rule = makeRule('r18','Rule18','CUSTOM','1','minor', () => true);
    const result = evaluateRuleSync(rule, makeContext('doc','d18', {}));
    expect(result.status).toBe('pass');
  });
  it('pass sync 19', () => {
    const rule = makeRule('r19','Rule19','CUSTOM','1','minor', () => true);
    const result = evaluateRuleSync(rule, makeContext('doc','d19', {}));
    expect(result.status).toBe('pass');
  });
  it('pass sync 20', () => {
    const rule = makeRule('r20','Rule20','CUSTOM','1','minor', () => true);
    const result = evaluateRuleSync(rule, makeContext('doc','d20', {}));
    expect(result.status).toBe('pass');
  });
  it('pass sync 21', () => {
    const rule = makeRule('r21','Rule21','CUSTOM','1','minor', () => true);
    const result = evaluateRuleSync(rule, makeContext('doc','d21', {}));
    expect(result.status).toBe('pass');
  });
  it('pass sync 22', () => {
    const rule = makeRule('r22','Rule22','CUSTOM','1','minor', () => true);
    const result = evaluateRuleSync(rule, makeContext('doc','d22', {}));
    expect(result.status).toBe('pass');
  });
  it('pass sync 23', () => {
    const rule = makeRule('r23','Rule23','CUSTOM','1','minor', () => true);
    const result = evaluateRuleSync(rule, makeContext('doc','d23', {}));
    expect(result.status).toBe('pass');
  });
  it('pass sync 24', () => {
    const rule = makeRule('r24','Rule24','CUSTOM','1','minor', () => true);
    const result = evaluateRuleSync(rule, makeContext('doc','d24', {}));
    expect(result.status).toBe('pass');
  });
  it('pass sync 25', () => {
    const rule = makeRule('r25','Rule25','CUSTOM','1','minor', () => true);
    const result = evaluateRuleSync(rule, makeContext('doc','d25', {}));
    expect(result.status).toBe('pass');
  });
  it('pass sync 26', () => {
    const rule = makeRule('r26','Rule26','CUSTOM','1','minor', () => true);
    const result = evaluateRuleSync(rule, makeContext('doc','d26', {}));
    expect(result.status).toBe('pass');
  });
  it('pass sync 27', () => {
    const rule = makeRule('r27','Rule27','CUSTOM','1','minor', () => true);
    const result = evaluateRuleSync(rule, makeContext('doc','d27', {}));
    expect(result.status).toBe('pass');
  });
  it('pass sync 28', () => {
    const rule = makeRule('r28','Rule28','CUSTOM','1','minor', () => true);
    const result = evaluateRuleSync(rule, makeContext('doc','d28', {}));
    expect(result.status).toBe('pass');
  });
  it('pass sync 29', () => {
    const rule = makeRule('r29','Rule29','CUSTOM','1','minor', () => true);
    const result = evaluateRuleSync(rule, makeContext('doc','d29', {}));
    expect(result.status).toBe('pass');
  });
  it('pass sync 30', () => {
    const rule = makeRule('r30','Rule30','CUSTOM','1','minor', () => true);
    const result = evaluateRuleSync(rule, makeContext('doc','d30', {}));
    expect(result.status).toBe('pass');
  });
  it('pass sync 31', () => {
    const rule = makeRule('r31','Rule31','CUSTOM','1','minor', () => true);
    const result = evaluateRuleSync(rule, makeContext('doc','d31', {}));
    expect(result.status).toBe('pass');
  });
  it('pass sync 32', () => {
    const rule = makeRule('r32','Rule32','CUSTOM','1','minor', () => true);
    const result = evaluateRuleSync(rule, makeContext('doc','d32', {}));
    expect(result.status).toBe('pass');
  });
  it('pass sync 33', () => {
    const rule = makeRule('r33','Rule33','CUSTOM','1','minor', () => true);
    const result = evaluateRuleSync(rule, makeContext('doc','d33', {}));
    expect(result.status).toBe('pass');
  });
  it('pass sync 34', () => {
    const rule = makeRule('r34','Rule34','CUSTOM','1','minor', () => true);
    const result = evaluateRuleSync(rule, makeContext('doc','d34', {}));
    expect(result.status).toBe('pass');
  });
  it('pass sync 35', () => {
    const rule = makeRule('r35','Rule35','CUSTOM','1','minor', () => true);
    const result = evaluateRuleSync(rule, makeContext('doc','d35', {}));
    expect(result.status).toBe('pass');
  });
  it('pass sync 36', () => {
    const rule = makeRule('r36','Rule36','CUSTOM','1','minor', () => true);
    const result = evaluateRuleSync(rule, makeContext('doc','d36', {}));
    expect(result.status).toBe('pass');
  });
  it('pass sync 37', () => {
    const rule = makeRule('r37','Rule37','CUSTOM','1','minor', () => true);
    const result = evaluateRuleSync(rule, makeContext('doc','d37', {}));
    expect(result.status).toBe('pass');
  });
  it('pass sync 38', () => {
    const rule = makeRule('r38','Rule38','CUSTOM','1','minor', () => true);
    const result = evaluateRuleSync(rule, makeContext('doc','d38', {}));
    expect(result.status).toBe('pass');
  });
  it('pass sync 39', () => {
    const rule = makeRule('r39','Rule39','CUSTOM','1','minor', () => true);
    const result = evaluateRuleSync(rule, makeContext('doc','d39', {}));
    expect(result.status).toBe('pass');
  });
  it('pass sync 40', () => {
    const rule = makeRule('r40','Rule40','CUSTOM','1','minor', () => true);
    const result = evaluateRuleSync(rule, makeContext('doc','d40', {}));
    expect(result.status).toBe('pass');
  });
  it('pass sync 41', () => {
    const rule = makeRule('r41','Rule41','CUSTOM','1','minor', () => true);
    const result = evaluateRuleSync(rule, makeContext('doc','d41', {}));
    expect(result.status).toBe('pass');
  });
  it('pass sync 42', () => {
    const rule = makeRule('r42','Rule42','CUSTOM','1','minor', () => true);
    const result = evaluateRuleSync(rule, makeContext('doc','d42', {}));
    expect(result.status).toBe('pass');
  });
  it('pass sync 43', () => {
    const rule = makeRule('r43','Rule43','CUSTOM','1','minor', () => true);
    const result = evaluateRuleSync(rule, makeContext('doc','d43', {}));
    expect(result.status).toBe('pass');
  });
  it('pass sync 44', () => {
    const rule = makeRule('r44','Rule44','CUSTOM','1','minor', () => true);
    const result = evaluateRuleSync(rule, makeContext('doc','d44', {}));
    expect(result.status).toBe('pass');
  });
  it('pass sync 45', () => {
    const rule = makeRule('r45','Rule45','CUSTOM','1','minor', () => true);
    const result = evaluateRuleSync(rule, makeContext('doc','d45', {}));
    expect(result.status).toBe('pass');
  });
  it('pass sync 46', () => {
    const rule = makeRule('r46','Rule46','CUSTOM','1','minor', () => true);
    const result = evaluateRuleSync(rule, makeContext('doc','d46', {}));
    expect(result.status).toBe('pass');
  });
  it('pass sync 47', () => {
    const rule = makeRule('r47','Rule47','CUSTOM','1','minor', () => true);
    const result = evaluateRuleSync(rule, makeContext('doc','d47', {}));
    expect(result.status).toBe('pass');
  });
  it('pass sync 48', () => {
    const rule = makeRule('r48','Rule48','CUSTOM','1','minor', () => true);
    const result = evaluateRuleSync(rule, makeContext('doc','d48', {}));
    expect(result.status).toBe('pass');
  });
  it('pass sync 49', () => {
    const rule = makeRule('r49','Rule49','CUSTOM','1','minor', () => true);
    const result = evaluateRuleSync(rule, makeContext('doc','d49', {}));
    expect(result.status).toBe('pass');
  });
  it('fail sync mandatory 0', () => {
    const rule = makeRule('r0','Rule0','CUSTOM','1','major', () => false, true);
    const result = evaluateRuleSync(rule, makeContext('doc','d0', {}));
    expect(result.status).toBe('fail');
  });
  it('fail sync mandatory 1', () => {
    const rule = makeRule('r1','Rule1','CUSTOM','1','major', () => false, true);
    const result = evaluateRuleSync(rule, makeContext('doc','d1', {}));
    expect(result.status).toBe('fail');
  });
  it('fail sync mandatory 2', () => {
    const rule = makeRule('r2','Rule2','CUSTOM','1','major', () => false, true);
    const result = evaluateRuleSync(rule, makeContext('doc','d2', {}));
    expect(result.status).toBe('fail');
  });
  it('fail sync mandatory 3', () => {
    const rule = makeRule('r3','Rule3','CUSTOM','1','major', () => false, true);
    const result = evaluateRuleSync(rule, makeContext('doc','d3', {}));
    expect(result.status).toBe('fail');
  });
  it('fail sync mandatory 4', () => {
    const rule = makeRule('r4','Rule4','CUSTOM','1','major', () => false, true);
    const result = evaluateRuleSync(rule, makeContext('doc','d4', {}));
    expect(result.status).toBe('fail');
  });
  it('fail sync mandatory 5', () => {
    const rule = makeRule('r5','Rule5','CUSTOM','1','major', () => false, true);
    const result = evaluateRuleSync(rule, makeContext('doc','d5', {}));
    expect(result.status).toBe('fail');
  });
  it('fail sync mandatory 6', () => {
    const rule = makeRule('r6','Rule6','CUSTOM','1','major', () => false, true);
    const result = evaluateRuleSync(rule, makeContext('doc','d6', {}));
    expect(result.status).toBe('fail');
  });
  it('fail sync mandatory 7', () => {
    const rule = makeRule('r7','Rule7','CUSTOM','1','major', () => false, true);
    const result = evaluateRuleSync(rule, makeContext('doc','d7', {}));
    expect(result.status).toBe('fail');
  });
  it('fail sync mandatory 8', () => {
    const rule = makeRule('r8','Rule8','CUSTOM','1','major', () => false, true);
    const result = evaluateRuleSync(rule, makeContext('doc','d8', {}));
    expect(result.status).toBe('fail');
  });
  it('fail sync mandatory 9', () => {
    const rule = makeRule('r9','Rule9','CUSTOM','1','major', () => false, true);
    const result = evaluateRuleSync(rule, makeContext('doc','d9', {}));
    expect(result.status).toBe('fail');
  });
  it('fail sync mandatory 10', () => {
    const rule = makeRule('r10','Rule10','CUSTOM','1','major', () => false, true);
    const result = evaluateRuleSync(rule, makeContext('doc','d10', {}));
    expect(result.status).toBe('fail');
  });
  it('fail sync mandatory 11', () => {
    const rule = makeRule('r11','Rule11','CUSTOM','1','major', () => false, true);
    const result = evaluateRuleSync(rule, makeContext('doc','d11', {}));
    expect(result.status).toBe('fail');
  });
  it('fail sync mandatory 12', () => {
    const rule = makeRule('r12','Rule12','CUSTOM','1','major', () => false, true);
    const result = evaluateRuleSync(rule, makeContext('doc','d12', {}));
    expect(result.status).toBe('fail');
  });
  it('fail sync mandatory 13', () => {
    const rule = makeRule('r13','Rule13','CUSTOM','1','major', () => false, true);
    const result = evaluateRuleSync(rule, makeContext('doc','d13', {}));
    expect(result.status).toBe('fail');
  });
  it('fail sync mandatory 14', () => {
    const rule = makeRule('r14','Rule14','CUSTOM','1','major', () => false, true);
    const result = evaluateRuleSync(rule, makeContext('doc','d14', {}));
    expect(result.status).toBe('fail');
  });
  it('fail sync mandatory 15', () => {
    const rule = makeRule('r15','Rule15','CUSTOM','1','major', () => false, true);
    const result = evaluateRuleSync(rule, makeContext('doc','d15', {}));
    expect(result.status).toBe('fail');
  });
  it('fail sync mandatory 16', () => {
    const rule = makeRule('r16','Rule16','CUSTOM','1','major', () => false, true);
    const result = evaluateRuleSync(rule, makeContext('doc','d16', {}));
    expect(result.status).toBe('fail');
  });
  it('fail sync mandatory 17', () => {
    const rule = makeRule('r17','Rule17','CUSTOM','1','major', () => false, true);
    const result = evaluateRuleSync(rule, makeContext('doc','d17', {}));
    expect(result.status).toBe('fail');
  });
  it('fail sync mandatory 18', () => {
    const rule = makeRule('r18','Rule18','CUSTOM','1','major', () => false, true);
    const result = evaluateRuleSync(rule, makeContext('doc','d18', {}));
    expect(result.status).toBe('fail');
  });
  it('fail sync mandatory 19', () => {
    const rule = makeRule('r19','Rule19','CUSTOM','1','major', () => false, true);
    const result = evaluateRuleSync(rule, makeContext('doc','d19', {}));
    expect(result.status).toBe('fail');
  });
  it('fail sync mandatory 20', () => {
    const rule = makeRule('r20','Rule20','CUSTOM','1','major', () => false, true);
    const result = evaluateRuleSync(rule, makeContext('doc','d20', {}));
    expect(result.status).toBe('fail');
  });
  it('fail sync mandatory 21', () => {
    const rule = makeRule('r21','Rule21','CUSTOM','1','major', () => false, true);
    const result = evaluateRuleSync(rule, makeContext('doc','d21', {}));
    expect(result.status).toBe('fail');
  });
  it('fail sync mandatory 22', () => {
    const rule = makeRule('r22','Rule22','CUSTOM','1','major', () => false, true);
    const result = evaluateRuleSync(rule, makeContext('doc','d22', {}));
    expect(result.status).toBe('fail');
  });
  it('fail sync mandatory 23', () => {
    const rule = makeRule('r23','Rule23','CUSTOM','1','major', () => false, true);
    const result = evaluateRuleSync(rule, makeContext('doc','d23', {}));
    expect(result.status).toBe('fail');
  });
  it('fail sync mandatory 24', () => {
    const rule = makeRule('r24','Rule24','CUSTOM','1','major', () => false, true);
    const result = evaluateRuleSync(rule, makeContext('doc','d24', {}));
    expect(result.status).toBe('fail');
  });
  it('fail sync mandatory 25', () => {
    const rule = makeRule('r25','Rule25','CUSTOM','1','major', () => false, true);
    const result = evaluateRuleSync(rule, makeContext('doc','d25', {}));
    expect(result.status).toBe('fail');
  });
  it('fail sync mandatory 26', () => {
    const rule = makeRule('r26','Rule26','CUSTOM','1','major', () => false, true);
    const result = evaluateRuleSync(rule, makeContext('doc','d26', {}));
    expect(result.status).toBe('fail');
  });
  it('fail sync mandatory 27', () => {
    const rule = makeRule('r27','Rule27','CUSTOM','1','major', () => false, true);
    const result = evaluateRuleSync(rule, makeContext('doc','d27', {}));
    expect(result.status).toBe('fail');
  });
  it('fail sync mandatory 28', () => {
    const rule = makeRule('r28','Rule28','CUSTOM','1','major', () => false, true);
    const result = evaluateRuleSync(rule, makeContext('doc','d28', {}));
    expect(result.status).toBe('fail');
  });
  it('fail sync mandatory 29', () => {
    const rule = makeRule('r29','Rule29','CUSTOM','1','major', () => false, true);
    const result = evaluateRuleSync(rule, makeContext('doc','d29', {}));
    expect(result.status).toBe('fail');
  });
  it('fail sync mandatory 30', () => {
    const rule = makeRule('r30','Rule30','CUSTOM','1','major', () => false, true);
    const result = evaluateRuleSync(rule, makeContext('doc','d30', {}));
    expect(result.status).toBe('fail');
  });
  it('fail sync mandatory 31', () => {
    const rule = makeRule('r31','Rule31','CUSTOM','1','major', () => false, true);
    const result = evaluateRuleSync(rule, makeContext('doc','d31', {}));
    expect(result.status).toBe('fail');
  });
  it('fail sync mandatory 32', () => {
    const rule = makeRule('r32','Rule32','CUSTOM','1','major', () => false, true);
    const result = evaluateRuleSync(rule, makeContext('doc','d32', {}));
    expect(result.status).toBe('fail');
  });
  it('fail sync mandatory 33', () => {
    const rule = makeRule('r33','Rule33','CUSTOM','1','major', () => false, true);
    const result = evaluateRuleSync(rule, makeContext('doc','d33', {}));
    expect(result.status).toBe('fail');
  });
  it('fail sync mandatory 34', () => {
    const rule = makeRule('r34','Rule34','CUSTOM','1','major', () => false, true);
    const result = evaluateRuleSync(rule, makeContext('doc','d34', {}));
    expect(result.status).toBe('fail');
  });
  it('fail sync mandatory 35', () => {
    const rule = makeRule('r35','Rule35','CUSTOM','1','major', () => false, true);
    const result = evaluateRuleSync(rule, makeContext('doc','d35', {}));
    expect(result.status).toBe('fail');
  });
  it('fail sync mandatory 36', () => {
    const rule = makeRule('r36','Rule36','CUSTOM','1','major', () => false, true);
    const result = evaluateRuleSync(rule, makeContext('doc','d36', {}));
    expect(result.status).toBe('fail');
  });
  it('fail sync mandatory 37', () => {
    const rule = makeRule('r37','Rule37','CUSTOM','1','major', () => false, true);
    const result = evaluateRuleSync(rule, makeContext('doc','d37', {}));
    expect(result.status).toBe('fail');
  });
  it('fail sync mandatory 38', () => {
    const rule = makeRule('r38','Rule38','CUSTOM','1','major', () => false, true);
    const result = evaluateRuleSync(rule, makeContext('doc','d38', {}));
    expect(result.status).toBe('fail');
  });
  it('fail sync mandatory 39', () => {
    const rule = makeRule('r39','Rule39','CUSTOM','1','major', () => false, true);
    const result = evaluateRuleSync(rule, makeContext('doc','d39', {}));
    expect(result.status).toBe('fail');
  });
  it('fail sync mandatory 40', () => {
    const rule = makeRule('r40','Rule40','CUSTOM','1','major', () => false, true);
    const result = evaluateRuleSync(rule, makeContext('doc','d40', {}));
    expect(result.status).toBe('fail');
  });
  it('fail sync mandatory 41', () => {
    const rule = makeRule('r41','Rule41','CUSTOM','1','major', () => false, true);
    const result = evaluateRuleSync(rule, makeContext('doc','d41', {}));
    expect(result.status).toBe('fail');
  });
  it('fail sync mandatory 42', () => {
    const rule = makeRule('r42','Rule42','CUSTOM','1','major', () => false, true);
    const result = evaluateRuleSync(rule, makeContext('doc','d42', {}));
    expect(result.status).toBe('fail');
  });
  it('fail sync mandatory 43', () => {
    const rule = makeRule('r43','Rule43','CUSTOM','1','major', () => false, true);
    const result = evaluateRuleSync(rule, makeContext('doc','d43', {}));
    expect(result.status).toBe('fail');
  });
  it('fail sync mandatory 44', () => {
    const rule = makeRule('r44','Rule44','CUSTOM','1','major', () => false, true);
    const result = evaluateRuleSync(rule, makeContext('doc','d44', {}));
    expect(result.status).toBe('fail');
  });
  it('fail sync mandatory 45', () => {
    const rule = makeRule('r45','Rule45','CUSTOM','1','major', () => false, true);
    const result = evaluateRuleSync(rule, makeContext('doc','d45', {}));
    expect(result.status).toBe('fail');
  });
  it('fail sync mandatory 46', () => {
    const rule = makeRule('r46','Rule46','CUSTOM','1','major', () => false, true);
    const result = evaluateRuleSync(rule, makeContext('doc','d46', {}));
    expect(result.status).toBe('fail');
  });
  it('fail sync mandatory 47', () => {
    const rule = makeRule('r47','Rule47','CUSTOM','1','major', () => false, true);
    const result = evaluateRuleSync(rule, makeContext('doc','d47', {}));
    expect(result.status).toBe('fail');
  });
  it('fail sync mandatory 48', () => {
    const rule = makeRule('r48','Rule48','CUSTOM','1','major', () => false, true);
    const result = evaluateRuleSync(rule, makeContext('doc','d48', {}));
    expect(result.status).toBe('fail');
  });
  it('fail sync mandatory 49', () => {
    const rule = makeRule('r49','Rule49','CUSTOM','1','major', () => false, true);
    const result = evaluateRuleSync(rule, makeContext('doc','d49', {}));
    expect(result.status).toBe('fail');
  });
  it('warning sync non-mandatory 0', () => {
    const rule = makeRule('r0','Rule0','CUSTOM','1','info', () => false, false);
    const result = evaluateRuleSync(rule, makeContext('doc','d0', {}));
    expect(result.status).toBe('warning');
  });
  it('warning sync non-mandatory 1', () => {
    const rule = makeRule('r1','Rule1','CUSTOM','1','info', () => false, false);
    const result = evaluateRuleSync(rule, makeContext('doc','d1', {}));
    expect(result.status).toBe('warning');
  });
  it('warning sync non-mandatory 2', () => {
    const rule = makeRule('r2','Rule2','CUSTOM','1','info', () => false, false);
    const result = evaluateRuleSync(rule, makeContext('doc','d2', {}));
    expect(result.status).toBe('warning');
  });
  it('warning sync non-mandatory 3', () => {
    const rule = makeRule('r3','Rule3','CUSTOM','1','info', () => false, false);
    const result = evaluateRuleSync(rule, makeContext('doc','d3', {}));
    expect(result.status).toBe('warning');
  });
  it('warning sync non-mandatory 4', () => {
    const rule = makeRule('r4','Rule4','CUSTOM','1','info', () => false, false);
    const result = evaluateRuleSync(rule, makeContext('doc','d4', {}));
    expect(result.status).toBe('warning');
  });
  it('warning sync non-mandatory 5', () => {
    const rule = makeRule('r5','Rule5','CUSTOM','1','info', () => false, false);
    const result = evaluateRuleSync(rule, makeContext('doc','d5', {}));
    expect(result.status).toBe('warning');
  });
  it('warning sync non-mandatory 6', () => {
    const rule = makeRule('r6','Rule6','CUSTOM','1','info', () => false, false);
    const result = evaluateRuleSync(rule, makeContext('doc','d6', {}));
    expect(result.status).toBe('warning');
  });
  it('warning sync non-mandatory 7', () => {
    const rule = makeRule('r7','Rule7','CUSTOM','1','info', () => false, false);
    const result = evaluateRuleSync(rule, makeContext('doc','d7', {}));
    expect(result.status).toBe('warning');
  });
  it('warning sync non-mandatory 8', () => {
    const rule = makeRule('r8','Rule8','CUSTOM','1','info', () => false, false);
    const result = evaluateRuleSync(rule, makeContext('doc','d8', {}));
    expect(result.status).toBe('warning');
  });
  it('warning sync non-mandatory 9', () => {
    const rule = makeRule('r9','Rule9','CUSTOM','1','info', () => false, false);
    const result = evaluateRuleSync(rule, makeContext('doc','d9', {}));
    expect(result.status).toBe('warning');
  });
  it('warning sync non-mandatory 10', () => {
    const rule = makeRule('r10','Rule10','CUSTOM','1','info', () => false, false);
    const result = evaluateRuleSync(rule, makeContext('doc','d10', {}));
    expect(result.status).toBe('warning');
  });
  it('warning sync non-mandatory 11', () => {
    const rule = makeRule('r11','Rule11','CUSTOM','1','info', () => false, false);
    const result = evaluateRuleSync(rule, makeContext('doc','d11', {}));
    expect(result.status).toBe('warning');
  });
  it('warning sync non-mandatory 12', () => {
    const rule = makeRule('r12','Rule12','CUSTOM','1','info', () => false, false);
    const result = evaluateRuleSync(rule, makeContext('doc','d12', {}));
    expect(result.status).toBe('warning');
  });
  it('warning sync non-mandatory 13', () => {
    const rule = makeRule('r13','Rule13','CUSTOM','1','info', () => false, false);
    const result = evaluateRuleSync(rule, makeContext('doc','d13', {}));
    expect(result.status).toBe('warning');
  });
  it('warning sync non-mandatory 14', () => {
    const rule = makeRule('r14','Rule14','CUSTOM','1','info', () => false, false);
    const result = evaluateRuleSync(rule, makeContext('doc','d14', {}));
    expect(result.status).toBe('warning');
  });
  it('warning sync non-mandatory 15', () => {
    const rule = makeRule('r15','Rule15','CUSTOM','1','info', () => false, false);
    const result = evaluateRuleSync(rule, makeContext('doc','d15', {}));
    expect(result.status).toBe('warning');
  });
  it('warning sync non-mandatory 16', () => {
    const rule = makeRule('r16','Rule16','CUSTOM','1','info', () => false, false);
    const result = evaluateRuleSync(rule, makeContext('doc','d16', {}));
    expect(result.status).toBe('warning');
  });
  it('warning sync non-mandatory 17', () => {
    const rule = makeRule('r17','Rule17','CUSTOM','1','info', () => false, false);
    const result = evaluateRuleSync(rule, makeContext('doc','d17', {}));
    expect(result.status).toBe('warning');
  });
  it('warning sync non-mandatory 18', () => {
    const rule = makeRule('r18','Rule18','CUSTOM','1','info', () => false, false);
    const result = evaluateRuleSync(rule, makeContext('doc','d18', {}));
    expect(result.status).toBe('warning');
  });
  it('warning sync non-mandatory 19', () => {
    const rule = makeRule('r19','Rule19','CUSTOM','1','info', () => false, false);
    const result = evaluateRuleSync(rule, makeContext('doc','d19', {}));
    expect(result.status).toBe('warning');
  });
  it('warning sync non-mandatory 20', () => {
    const rule = makeRule('r20','Rule20','CUSTOM','1','info', () => false, false);
    const result = evaluateRuleSync(rule, makeContext('doc','d20', {}));
    expect(result.status).toBe('warning');
  });
  it('warning sync non-mandatory 21', () => {
    const rule = makeRule('r21','Rule21','CUSTOM','1','info', () => false, false);
    const result = evaluateRuleSync(rule, makeContext('doc','d21', {}));
    expect(result.status).toBe('warning');
  });
  it('warning sync non-mandatory 22', () => {
    const rule = makeRule('r22','Rule22','CUSTOM','1','info', () => false, false);
    const result = evaluateRuleSync(rule, makeContext('doc','d22', {}));
    expect(result.status).toBe('warning');
  });
  it('warning sync non-mandatory 23', () => {
    const rule = makeRule('r23','Rule23','CUSTOM','1','info', () => false, false);
    const result = evaluateRuleSync(rule, makeContext('doc','d23', {}));
    expect(result.status).toBe('warning');
  });
  it('warning sync non-mandatory 24', () => {
    const rule = makeRule('r24','Rule24','CUSTOM','1','info', () => false, false);
    const result = evaluateRuleSync(rule, makeContext('doc','d24', {}));
    expect(result.status).toBe('warning');
  });
  it('warning sync non-mandatory 25', () => {
    const rule = makeRule('r25','Rule25','CUSTOM','1','info', () => false, false);
    const result = evaluateRuleSync(rule, makeContext('doc','d25', {}));
    expect(result.status).toBe('warning');
  });
  it('warning sync non-mandatory 26', () => {
    const rule = makeRule('r26','Rule26','CUSTOM','1','info', () => false, false);
    const result = evaluateRuleSync(rule, makeContext('doc','d26', {}));
    expect(result.status).toBe('warning');
  });
  it('warning sync non-mandatory 27', () => {
    const rule = makeRule('r27','Rule27','CUSTOM','1','info', () => false, false);
    const result = evaluateRuleSync(rule, makeContext('doc','d27', {}));
    expect(result.status).toBe('warning');
  });
  it('warning sync non-mandatory 28', () => {
    const rule = makeRule('r28','Rule28','CUSTOM','1','info', () => false, false);
    const result = evaluateRuleSync(rule, makeContext('doc','d28', {}));
    expect(result.status).toBe('warning');
  });
  it('warning sync non-mandatory 29', () => {
    const rule = makeRule('r29','Rule29','CUSTOM','1','info', () => false, false);
    const result = evaluateRuleSync(rule, makeContext('doc','d29', {}));
    expect(result.status).toBe('warning');
  });
  it('pending for async rule', () => {
    const rule: ComplianceRule = { id: 'a1', name: 'A', description: 'A', standard: 'CUSTOM', clause: '1', severity: 'minor', mandatory: true, check: async () => true };
    expect(evaluateRuleSync(rule, makeContext('t','e', {})).status).toBe('pending');
  });
  it('fail when check throws Error', () => {
    const rule: ComplianceRule = { id: 'e1', name: 'E', description: 'E', standard: 'CUSTOM', clause: '1', severity: 'critical', mandatory: true, check: () => { throw new Error('boom'); } };
    const res = evaluateRuleSync(rule, makeContext('t','e', {}));
    expect(res.status).toBe('fail'); expect(res.message).toBe('boom');
  });
  it('ruleId in result', () => {
    const rule = makeRule('MY_RULE','n','CUSTOM','1','minor', () => true);
    expect(evaluateRuleSync(rule, makeContext('t','e', {})).ruleId).toBe('MY_RULE');
  });
  it('ruleName in result', () => {
    const rule = makeRule('r','MyRuleName','CUSTOM','1','minor', () => true);
    expect(evaluateRuleSync(rule, makeContext('t','e', {})).ruleName).toBe('MyRuleName');
  });
  it('timestamp is a number', () => {
    const rule = makeRule('r','n','CUSTOM','1','minor', () => true);
    expect(typeof evaluateRuleSync(rule, makeContext('t','e', {})).timestamp).toBe('number');
  });
  severities.forEach(sev => {
    it('preserves severity: ' + sev, () => {
      const rule = makeRule('r','n','CUSTOM','1', sev, () => true);
      expect(evaluateRuleSync(rule, makeContext('t','e', {})).severity).toBe(sev);
    });
  });
});

describe('evaluateRule async', () => {
  it('async pass 0', async () => {
    const rule = makeRule('r0','R0','CUSTOM','1','minor', () => true);
    const res = await evaluateRule(rule, makeContext('d','e0', {}));
    expect(res.status).toBe('pass');
  });
  it('async pass 1', async () => {
    const rule = makeRule('r1','R1','CUSTOM','1','minor', () => true);
    const res = await evaluateRule(rule, makeContext('d','e1', {}));
    expect(res.status).toBe('pass');
  });
  it('async pass 2', async () => {
    const rule = makeRule('r2','R2','CUSTOM','1','minor', () => true);
    const res = await evaluateRule(rule, makeContext('d','e2', {}));
    expect(res.status).toBe('pass');
  });
  it('async pass 3', async () => {
    const rule = makeRule('r3','R3','CUSTOM','1','minor', () => true);
    const res = await evaluateRule(rule, makeContext('d','e3', {}));
    expect(res.status).toBe('pass');
  });
  it('async pass 4', async () => {
    const rule = makeRule('r4','R4','CUSTOM','1','minor', () => true);
    const res = await evaluateRule(rule, makeContext('d','e4', {}));
    expect(res.status).toBe('pass');
  });
  it('async pass 5', async () => {
    const rule = makeRule('r5','R5','CUSTOM','1','minor', () => true);
    const res = await evaluateRule(rule, makeContext('d','e5', {}));
    expect(res.status).toBe('pass');
  });
  it('async pass 6', async () => {
    const rule = makeRule('r6','R6','CUSTOM','1','minor', () => true);
    const res = await evaluateRule(rule, makeContext('d','e6', {}));
    expect(res.status).toBe('pass');
  });
  it('async pass 7', async () => {
    const rule = makeRule('r7','R7','CUSTOM','1','minor', () => true);
    const res = await evaluateRule(rule, makeContext('d','e7', {}));
    expect(res.status).toBe('pass');
  });
  it('async pass 8', async () => {
    const rule = makeRule('r8','R8','CUSTOM','1','minor', () => true);
    const res = await evaluateRule(rule, makeContext('d','e8', {}));
    expect(res.status).toBe('pass');
  });
  it('async pass 9', async () => {
    const rule = makeRule('r9','R9','CUSTOM','1','minor', () => true);
    const res = await evaluateRule(rule, makeContext('d','e9', {}));
    expect(res.status).toBe('pass');
  });
  it('async pass 10', async () => {
    const rule = makeRule('r10','R10','CUSTOM','1','minor', () => true);
    const res = await evaluateRule(rule, makeContext('d','e10', {}));
    expect(res.status).toBe('pass');
  });
  it('async pass 11', async () => {
    const rule = makeRule('r11','R11','CUSTOM','1','minor', () => true);
    const res = await evaluateRule(rule, makeContext('d','e11', {}));
    expect(res.status).toBe('pass');
  });
  it('async pass 12', async () => {
    const rule = makeRule('r12','R12','CUSTOM','1','minor', () => true);
    const res = await evaluateRule(rule, makeContext('d','e12', {}));
    expect(res.status).toBe('pass');
  });
  it('async pass 13', async () => {
    const rule = makeRule('r13','R13','CUSTOM','1','minor', () => true);
    const res = await evaluateRule(rule, makeContext('d','e13', {}));
    expect(res.status).toBe('pass');
  });
  it('async pass 14', async () => {
    const rule = makeRule('r14','R14','CUSTOM','1','minor', () => true);
    const res = await evaluateRule(rule, makeContext('d','e14', {}));
    expect(res.status).toBe('pass');
  });
  it('async pass 15', async () => {
    const rule = makeRule('r15','R15','CUSTOM','1','minor', () => true);
    const res = await evaluateRule(rule, makeContext('d','e15', {}));
    expect(res.status).toBe('pass');
  });
  it('async pass 16', async () => {
    const rule = makeRule('r16','R16','CUSTOM','1','minor', () => true);
    const res = await evaluateRule(rule, makeContext('d','e16', {}));
    expect(res.status).toBe('pass');
  });
  it('async pass 17', async () => {
    const rule = makeRule('r17','R17','CUSTOM','1','minor', () => true);
    const res = await evaluateRule(rule, makeContext('d','e17', {}));
    expect(res.status).toBe('pass');
  });
  it('async pass 18', async () => {
    const rule = makeRule('r18','R18','CUSTOM','1','minor', () => true);
    const res = await evaluateRule(rule, makeContext('d','e18', {}));
    expect(res.status).toBe('pass');
  });
  it('async pass 19', async () => {
    const rule = makeRule('r19','R19','CUSTOM','1','minor', () => true);
    const res = await evaluateRule(rule, makeContext('d','e19', {}));
    expect(res.status).toBe('pass');
  });
  it('async pass 20', async () => {
    const rule = makeRule('r20','R20','CUSTOM','1','minor', () => true);
    const res = await evaluateRule(rule, makeContext('d','e20', {}));
    expect(res.status).toBe('pass');
  });
  it('async pass 21', async () => {
    const rule = makeRule('r21','R21','CUSTOM','1','minor', () => true);
    const res = await evaluateRule(rule, makeContext('d','e21', {}));
    expect(res.status).toBe('pass');
  });
  it('async pass 22', async () => {
    const rule = makeRule('r22','R22','CUSTOM','1','minor', () => true);
    const res = await evaluateRule(rule, makeContext('d','e22', {}));
    expect(res.status).toBe('pass');
  });
  it('async pass 23', async () => {
    const rule = makeRule('r23','R23','CUSTOM','1','minor', () => true);
    const res = await evaluateRule(rule, makeContext('d','e23', {}));
    expect(res.status).toBe('pass');
  });
  it('async pass 24', async () => {
    const rule = makeRule('r24','R24','CUSTOM','1','minor', () => true);
    const res = await evaluateRule(rule, makeContext('d','e24', {}));
    expect(res.status).toBe('pass');
  });
  it('async pass 25', async () => {
    const rule = makeRule('r25','R25','CUSTOM','1','minor', () => true);
    const res = await evaluateRule(rule, makeContext('d','e25', {}));
    expect(res.status).toBe('pass');
  });
  it('async pass 26', async () => {
    const rule = makeRule('r26','R26','CUSTOM','1','minor', () => true);
    const res = await evaluateRule(rule, makeContext('d','e26', {}));
    expect(res.status).toBe('pass');
  });
  it('async pass 27', async () => {
    const rule = makeRule('r27','R27','CUSTOM','1','minor', () => true);
    const res = await evaluateRule(rule, makeContext('d','e27', {}));
    expect(res.status).toBe('pass');
  });
  it('async pass 28', async () => {
    const rule = makeRule('r28','R28','CUSTOM','1','minor', () => true);
    const res = await evaluateRule(rule, makeContext('d','e28', {}));
    expect(res.status).toBe('pass');
  });
  it('async pass 29', async () => {
    const rule = makeRule('r29','R29','CUSTOM','1','minor', () => true);
    const res = await evaluateRule(rule, makeContext('d','e29', {}));
    expect(res.status).toBe('pass');
  });
  it('async fail mandatory 0', async () => {
    const rule = makeRule('r0','R0','CUSTOM','1','major', () => false, true);
    const res = await evaluateRule(rule, makeContext('d','e0', {}));
    expect(res.status).toBe('fail');
  });
  it('async fail mandatory 1', async () => {
    const rule = makeRule('r1','R1','CUSTOM','1','major', () => false, true);
    const res = await evaluateRule(rule, makeContext('d','e1', {}));
    expect(res.status).toBe('fail');
  });
  it('async fail mandatory 2', async () => {
    const rule = makeRule('r2','R2','CUSTOM','1','major', () => false, true);
    const res = await evaluateRule(rule, makeContext('d','e2', {}));
    expect(res.status).toBe('fail');
  });
  it('async fail mandatory 3', async () => {
    const rule = makeRule('r3','R3','CUSTOM','1','major', () => false, true);
    const res = await evaluateRule(rule, makeContext('d','e3', {}));
    expect(res.status).toBe('fail');
  });
  it('async fail mandatory 4', async () => {
    const rule = makeRule('r4','R4','CUSTOM','1','major', () => false, true);
    const res = await evaluateRule(rule, makeContext('d','e4', {}));
    expect(res.status).toBe('fail');
  });
  it('async fail mandatory 5', async () => {
    const rule = makeRule('r5','R5','CUSTOM','1','major', () => false, true);
    const res = await evaluateRule(rule, makeContext('d','e5', {}));
    expect(res.status).toBe('fail');
  });
  it('async fail mandatory 6', async () => {
    const rule = makeRule('r6','R6','CUSTOM','1','major', () => false, true);
    const res = await evaluateRule(rule, makeContext('d','e6', {}));
    expect(res.status).toBe('fail');
  });
  it('async fail mandatory 7', async () => {
    const rule = makeRule('r7','R7','CUSTOM','1','major', () => false, true);
    const res = await evaluateRule(rule, makeContext('d','e7', {}));
    expect(res.status).toBe('fail');
  });
  it('async fail mandatory 8', async () => {
    const rule = makeRule('r8','R8','CUSTOM','1','major', () => false, true);
    const res = await evaluateRule(rule, makeContext('d','e8', {}));
    expect(res.status).toBe('fail');
  });
  it('async fail mandatory 9', async () => {
    const rule = makeRule('r9','R9','CUSTOM','1','major', () => false, true);
    const res = await evaluateRule(rule, makeContext('d','e9', {}));
    expect(res.status).toBe('fail');
  });
  it('async fail mandatory 10', async () => {
    const rule = makeRule('r10','R10','CUSTOM','1','major', () => false, true);
    const res = await evaluateRule(rule, makeContext('d','e10', {}));
    expect(res.status).toBe('fail');
  });
  it('async fail mandatory 11', async () => {
    const rule = makeRule('r11','R11','CUSTOM','1','major', () => false, true);
    const res = await evaluateRule(rule, makeContext('d','e11', {}));
    expect(res.status).toBe('fail');
  });
  it('async fail mandatory 12', async () => {
    const rule = makeRule('r12','R12','CUSTOM','1','major', () => false, true);
    const res = await evaluateRule(rule, makeContext('d','e12', {}));
    expect(res.status).toBe('fail');
  });
  it('async fail mandatory 13', async () => {
    const rule = makeRule('r13','R13','CUSTOM','1','major', () => false, true);
    const res = await evaluateRule(rule, makeContext('d','e13', {}));
    expect(res.status).toBe('fail');
  });
  it('async fail mandatory 14', async () => {
    const rule = makeRule('r14','R14','CUSTOM','1','major', () => false, true);
    const res = await evaluateRule(rule, makeContext('d','e14', {}));
    expect(res.status).toBe('fail');
  });
  it('async fail mandatory 15', async () => {
    const rule = makeRule('r15','R15','CUSTOM','1','major', () => false, true);
    const res = await evaluateRule(rule, makeContext('d','e15', {}));
    expect(res.status).toBe('fail');
  });
  it('async fail mandatory 16', async () => {
    const rule = makeRule('r16','R16','CUSTOM','1','major', () => false, true);
    const res = await evaluateRule(rule, makeContext('d','e16', {}));
    expect(res.status).toBe('fail');
  });
  it('async fail mandatory 17', async () => {
    const rule = makeRule('r17','R17','CUSTOM','1','major', () => false, true);
    const res = await evaluateRule(rule, makeContext('d','e17', {}));
    expect(res.status).toBe('fail');
  });
  it('async fail mandatory 18', async () => {
    const rule = makeRule('r18','R18','CUSTOM','1','major', () => false, true);
    const res = await evaluateRule(rule, makeContext('d','e18', {}));
    expect(res.status).toBe('fail');
  });
  it('async fail mandatory 19', async () => {
    const rule = makeRule('r19','R19','CUSTOM','1','major', () => false, true);
    const res = await evaluateRule(rule, makeContext('d','e19', {}));
    expect(res.status).toBe('fail');
  });
  it('async fail mandatory 20', async () => {
    const rule = makeRule('r20','R20','CUSTOM','1','major', () => false, true);
    const res = await evaluateRule(rule, makeContext('d','e20', {}));
    expect(res.status).toBe('fail');
  });
  it('async fail mandatory 21', async () => {
    const rule = makeRule('r21','R21','CUSTOM','1','major', () => false, true);
    const res = await evaluateRule(rule, makeContext('d','e21', {}));
    expect(res.status).toBe('fail');
  });
  it('async fail mandatory 22', async () => {
    const rule = makeRule('r22','R22','CUSTOM','1','major', () => false, true);
    const res = await evaluateRule(rule, makeContext('d','e22', {}));
    expect(res.status).toBe('fail');
  });
  it('async fail mandatory 23', async () => {
    const rule = makeRule('r23','R23','CUSTOM','1','major', () => false, true);
    const res = await evaluateRule(rule, makeContext('d','e23', {}));
    expect(res.status).toBe('fail');
  });
  it('async fail mandatory 24', async () => {
    const rule = makeRule('r24','R24','CUSTOM','1','major', () => false, true);
    const res = await evaluateRule(rule, makeContext('d','e24', {}));
    expect(res.status).toBe('fail');
  });
  it('async fail mandatory 25', async () => {
    const rule = makeRule('r25','R25','CUSTOM','1','major', () => false, true);
    const res = await evaluateRule(rule, makeContext('d','e25', {}));
    expect(res.status).toBe('fail');
  });
  it('async fail mandatory 26', async () => {
    const rule = makeRule('r26','R26','CUSTOM','1','major', () => false, true);
    const res = await evaluateRule(rule, makeContext('d','e26', {}));
    expect(res.status).toBe('fail');
  });
  it('async fail mandatory 27', async () => {
    const rule = makeRule('r27','R27','CUSTOM','1','major', () => false, true);
    const res = await evaluateRule(rule, makeContext('d','e27', {}));
    expect(res.status).toBe('fail');
  });
  it('async fail mandatory 28', async () => {
    const rule = makeRule('r28','R28','CUSTOM','1','major', () => false, true);
    const res = await evaluateRule(rule, makeContext('d','e28', {}));
    expect(res.status).toBe('fail');
  });
  it('async fail mandatory 29', async () => {
    const rule = makeRule('r29','R29','CUSTOM','1','major', () => false, true);
    const res = await evaluateRule(rule, makeContext('d','e29', {}));
    expect(res.status).toBe('fail');
  });
  it('async warn non-mandatory 0', async () => {
    const rule = makeRule('r0','R0','CUSTOM','1','info', () => false, false);
    const res = await evaluateRule(rule, makeContext('d','e0', {}));
    expect(res.status).toBe('warning');
  });
  it('async warn non-mandatory 1', async () => {
    const rule = makeRule('r1','R1','CUSTOM','1','info', () => false, false);
    const res = await evaluateRule(rule, makeContext('d','e1', {}));
    expect(res.status).toBe('warning');
  });
  it('async warn non-mandatory 2', async () => {
    const rule = makeRule('r2','R2','CUSTOM','1','info', () => false, false);
    const res = await evaluateRule(rule, makeContext('d','e2', {}));
    expect(res.status).toBe('warning');
  });
  it('async warn non-mandatory 3', async () => {
    const rule = makeRule('r3','R3','CUSTOM','1','info', () => false, false);
    const res = await evaluateRule(rule, makeContext('d','e3', {}));
    expect(res.status).toBe('warning');
  });
  it('async warn non-mandatory 4', async () => {
    const rule = makeRule('r4','R4','CUSTOM','1','info', () => false, false);
    const res = await evaluateRule(rule, makeContext('d','e4', {}));
    expect(res.status).toBe('warning');
  });
  it('async warn non-mandatory 5', async () => {
    const rule = makeRule('r5','R5','CUSTOM','1','info', () => false, false);
    const res = await evaluateRule(rule, makeContext('d','e5', {}));
    expect(res.status).toBe('warning');
  });
  it('async warn non-mandatory 6', async () => {
    const rule = makeRule('r6','R6','CUSTOM','1','info', () => false, false);
    const res = await evaluateRule(rule, makeContext('d','e6', {}));
    expect(res.status).toBe('warning');
  });
  it('async warn non-mandatory 7', async () => {
    const rule = makeRule('r7','R7','CUSTOM','1','info', () => false, false);
    const res = await evaluateRule(rule, makeContext('d','e7', {}));
    expect(res.status).toBe('warning');
  });
  it('async warn non-mandatory 8', async () => {
    const rule = makeRule('r8','R8','CUSTOM','1','info', () => false, false);
    const res = await evaluateRule(rule, makeContext('d','e8', {}));
    expect(res.status).toBe('warning');
  });
  it('async warn non-mandatory 9', async () => {
    const rule = makeRule('r9','R9','CUSTOM','1','info', () => false, false);
    const res = await evaluateRule(rule, makeContext('d','e9', {}));
    expect(res.status).toBe('warning');
  });
  it('async warn non-mandatory 10', async () => {
    const rule = makeRule('r10','R10','CUSTOM','1','info', () => false, false);
    const res = await evaluateRule(rule, makeContext('d','e10', {}));
    expect(res.status).toBe('warning');
  });
  it('async warn non-mandatory 11', async () => {
    const rule = makeRule('r11','R11','CUSTOM','1','info', () => false, false);
    const res = await evaluateRule(rule, makeContext('d','e11', {}));
    expect(res.status).toBe('warning');
  });
  it('async warn non-mandatory 12', async () => {
    const rule = makeRule('r12','R12','CUSTOM','1','info', () => false, false);
    const res = await evaluateRule(rule, makeContext('d','e12', {}));
    expect(res.status).toBe('warning');
  });
  it('async warn non-mandatory 13', async () => {
    const rule = makeRule('r13','R13','CUSTOM','1','info', () => false, false);
    const res = await evaluateRule(rule, makeContext('d','e13', {}));
    expect(res.status).toBe('warning');
  });
  it('async warn non-mandatory 14', async () => {
    const rule = makeRule('r14','R14','CUSTOM','1','info', () => false, false);
    const res = await evaluateRule(rule, makeContext('d','e14', {}));
    expect(res.status).toBe('warning');
  });
  it('async warn non-mandatory 15', async () => {
    const rule = makeRule('r15','R15','CUSTOM','1','info', () => false, false);
    const res = await evaluateRule(rule, makeContext('d','e15', {}));
    expect(res.status).toBe('warning');
  });
  it('async warn non-mandatory 16', async () => {
    const rule = makeRule('r16','R16','CUSTOM','1','info', () => false, false);
    const res = await evaluateRule(rule, makeContext('d','e16', {}));
    expect(res.status).toBe('warning');
  });
  it('async warn non-mandatory 17', async () => {
    const rule = makeRule('r17','R17','CUSTOM','1','info', () => false, false);
    const res = await evaluateRule(rule, makeContext('d','e17', {}));
    expect(res.status).toBe('warning');
  });
  it('async warn non-mandatory 18', async () => {
    const rule = makeRule('r18','R18','CUSTOM','1','info', () => false, false);
    const res = await evaluateRule(rule, makeContext('d','e18', {}));
    expect(res.status).toBe('warning');
  });
  it('async warn non-mandatory 19', async () => {
    const rule = makeRule('r19','R19','CUSTOM','1','info', () => false, false);
    const res = await evaluateRule(rule, makeContext('d','e19', {}));
    expect(res.status).toBe('warning');
  });
  it('resolves async check true', async () => {
    const rule: ComplianceRule = { id: 'a1', name: 'A', description: 'A', standard: 'CUSTOM', clause: '1', severity: 'minor', mandatory: true, check: async () => true };
    expect((await evaluateRule(rule, makeContext('t','e', {}))).status).toBe('pass');
  });
  it('resolves async check false mandatory', async () => {
    const rule: ComplianceRule = { id: 'a2', name: 'A', description: 'A', standard: 'CUSTOM', clause: '1', severity: 'major', mandatory: true, check: async () => false };
    expect((await evaluateRule(rule, makeContext('t','e', {}))).status).toBe('fail');
  });
  it('async catches Error', async () => {
    const rule: ComplianceRule = { id: 'e1', name: 'E', description: 'E', standard: 'CUSTOM', clause: '1', severity: 'critical', mandatory: true, check: async () => { throw new Error('async err'); } };
    const res = await evaluateRule(rule, makeContext('t','e', {}));
    expect(res.status).toBe('fail'); expect(res.message).toBe('async err');
  });
  it('async catches non-Error', async () => {
    const rule: ComplianceRule = { id: 'e2', name: 'E', description: 'E', standard: 'CUSTOM', clause: '1', severity: 'critical', mandatory: true, check: async () => { throw 42; } };
    const res = await evaluateRule(rule, makeContext('t','e', {}));
    expect(res.status).toBe('fail'); expect(res.message).toBe('Rule evaluation error');
  });
  severities.forEach(sev => {
    it('async preserves sev: ' + sev, async () => {
      const rule = makeRule('r','n','CUSTOM','1', sev, () => true);
      expect((await evaluateRule(rule, makeContext('t','e', {}))).severity).toBe(sev);
    });
  });
});

describe('evaluateRules batch', () => {
  it('batch 1 passing', async () => {
    const rules = Array.from({ length: 1 }, (_, i) => makeRule('r' + i, 'R' + i, 'CUSTOM', '1', 'minor', () => true));
    const res = await evaluateRules(rules, makeContext('d','x', {}));
    expect(res).toHaveLength(1); res.forEach(r => expect(r.status).toBe('pass'));
  });
  it('batch 2 passing', async () => {
    const rules = Array.from({ length: 2 }, (_, i) => makeRule('r' + i, 'R' + i, 'CUSTOM', '1', 'minor', () => true));
    const res = await evaluateRules(rules, makeContext('d','x', {}));
    expect(res).toHaveLength(2); res.forEach(r => expect(r.status).toBe('pass'));
  });
  it('batch 3 passing', async () => {
    const rules = Array.from({ length: 3 }, (_, i) => makeRule('r' + i, 'R' + i, 'CUSTOM', '1', 'minor', () => true));
    const res = await evaluateRules(rules, makeContext('d','x', {}));
    expect(res).toHaveLength(3); res.forEach(r => expect(r.status).toBe('pass'));
  });
  it('batch 4 passing', async () => {
    const rules = Array.from({ length: 4 }, (_, i) => makeRule('r' + i, 'R' + i, 'CUSTOM', '1', 'minor', () => true));
    const res = await evaluateRules(rules, makeContext('d','x', {}));
    expect(res).toHaveLength(4); res.forEach(r => expect(r.status).toBe('pass'));
  });
  it('batch 5 passing', async () => {
    const rules = Array.from({ length: 5 }, (_, i) => makeRule('r' + i, 'R' + i, 'CUSTOM', '1', 'minor', () => true));
    const res = await evaluateRules(rules, makeContext('d','x', {}));
    expect(res).toHaveLength(5); res.forEach(r => expect(r.status).toBe('pass'));
  });
  it('batch 6 passing', async () => {
    const rules = Array.from({ length: 6 }, (_, i) => makeRule('r' + i, 'R' + i, 'CUSTOM', '1', 'minor', () => true));
    const res = await evaluateRules(rules, makeContext('d','x', {}));
    expect(res).toHaveLength(6); res.forEach(r => expect(r.status).toBe('pass'));
  });
  it('batch 7 passing', async () => {
    const rules = Array.from({ length: 7 }, (_, i) => makeRule('r' + i, 'R' + i, 'CUSTOM', '1', 'minor', () => true));
    const res = await evaluateRules(rules, makeContext('d','x', {}));
    expect(res).toHaveLength(7); res.forEach(r => expect(r.status).toBe('pass'));
  });
  it('batch 8 passing', async () => {
    const rules = Array.from({ length: 8 }, (_, i) => makeRule('r' + i, 'R' + i, 'CUSTOM', '1', 'minor', () => true));
    const res = await evaluateRules(rules, makeContext('d','x', {}));
    expect(res).toHaveLength(8); res.forEach(r => expect(r.status).toBe('pass'));
  });
  it('batch 9 passing', async () => {
    const rules = Array.from({ length: 9 }, (_, i) => makeRule('r' + i, 'R' + i, 'CUSTOM', '1', 'minor', () => true));
    const res = await evaluateRules(rules, makeContext('d','x', {}));
    expect(res).toHaveLength(9); res.forEach(r => expect(r.status).toBe('pass'));
  });
  it('batch 10 passing', async () => {
    const rules = Array.from({ length: 10 }, (_, i) => makeRule('r' + i, 'R' + i, 'CUSTOM', '1', 'minor', () => true));
    const res = await evaluateRules(rules, makeContext('d','x', {}));
    expect(res).toHaveLength(10); res.forEach(r => expect(r.status).toBe('pass'));
  });
  it('batch 11 passing', async () => {
    const rules = Array.from({ length: 11 }, (_, i) => makeRule('r' + i, 'R' + i, 'CUSTOM', '1', 'minor', () => true));
    const res = await evaluateRules(rules, makeContext('d','x', {}));
    expect(res).toHaveLength(11); res.forEach(r => expect(r.status).toBe('pass'));
  });
  it('batch 12 passing', async () => {
    const rules = Array.from({ length: 12 }, (_, i) => makeRule('r' + i, 'R' + i, 'CUSTOM', '1', 'minor', () => true));
    const res = await evaluateRules(rules, makeContext('d','x', {}));
    expect(res).toHaveLength(12); res.forEach(r => expect(r.status).toBe('pass'));
  });
  it('batch 13 passing', async () => {
    const rules = Array.from({ length: 13 }, (_, i) => makeRule('r' + i, 'R' + i, 'CUSTOM', '1', 'minor', () => true));
    const res = await evaluateRules(rules, makeContext('d','x', {}));
    expect(res).toHaveLength(13); res.forEach(r => expect(r.status).toBe('pass'));
  });
  it('batch 14 passing', async () => {
    const rules = Array.from({ length: 14 }, (_, i) => makeRule('r' + i, 'R' + i, 'CUSTOM', '1', 'minor', () => true));
    const res = await evaluateRules(rules, makeContext('d','x', {}));
    expect(res).toHaveLength(14); res.forEach(r => expect(r.status).toBe('pass'));
  });
  it('batch 15 passing', async () => {
    const rules = Array.from({ length: 15 }, (_, i) => makeRule('r' + i, 'R' + i, 'CUSTOM', '1', 'minor', () => true));
    const res = await evaluateRules(rules, makeContext('d','x', {}));
    expect(res).toHaveLength(15); res.forEach(r => expect(r.status).toBe('pass'));
  });
  it('batch 16 passing', async () => {
    const rules = Array.from({ length: 16 }, (_, i) => makeRule('r' + i, 'R' + i, 'CUSTOM', '1', 'minor', () => true));
    const res = await evaluateRules(rules, makeContext('d','x', {}));
    expect(res).toHaveLength(16); res.forEach(r => expect(r.status).toBe('pass'));
  });
  it('batch 17 passing', async () => {
    const rules = Array.from({ length: 17 }, (_, i) => makeRule('r' + i, 'R' + i, 'CUSTOM', '1', 'minor', () => true));
    const res = await evaluateRules(rules, makeContext('d','x', {}));
    expect(res).toHaveLength(17); res.forEach(r => expect(r.status).toBe('pass'));
  });
  it('batch 18 passing', async () => {
    const rules = Array.from({ length: 18 }, (_, i) => makeRule('r' + i, 'R' + i, 'CUSTOM', '1', 'minor', () => true));
    const res = await evaluateRules(rules, makeContext('d','x', {}));
    expect(res).toHaveLength(18); res.forEach(r => expect(r.status).toBe('pass'));
  });
  it('batch 19 passing', async () => {
    const rules = Array.from({ length: 19 }, (_, i) => makeRule('r' + i, 'R' + i, 'CUSTOM', '1', 'minor', () => true));
    const res = await evaluateRules(rules, makeContext('d','x', {}));
    expect(res).toHaveLength(19); res.forEach(r => expect(r.status).toBe('pass'));
  });
  it('batch 20 passing', async () => {
    const rules = Array.from({ length: 20 }, (_, i) => makeRule('r' + i, 'R' + i, 'CUSTOM', '1', 'minor', () => true));
    const res = await evaluateRules(rules, makeContext('d','x', {}));
    expect(res).toHaveLength(20); res.forEach(r => expect(r.status).toBe('pass'));
  });
  it('batch 1 failing', async () => {
    const rules = Array.from({ length: 1 }, (_, i) => makeRule('r' + i, 'R' + i, 'CUSTOM', '1', 'major', () => false, true));
    const res = await evaluateRules(rules, makeContext('d','x', {}));
    expect(res).toHaveLength(1); res.forEach(r => expect(r.status).toBe('fail'));
  });
  it('batch 2 failing', async () => {
    const rules = Array.from({ length: 2 }, (_, i) => makeRule('r' + i, 'R' + i, 'CUSTOM', '1', 'major', () => false, true));
    const res = await evaluateRules(rules, makeContext('d','x', {}));
    expect(res).toHaveLength(2); res.forEach(r => expect(r.status).toBe('fail'));
  });
  it('batch 3 failing', async () => {
    const rules = Array.from({ length: 3 }, (_, i) => makeRule('r' + i, 'R' + i, 'CUSTOM', '1', 'major', () => false, true));
    const res = await evaluateRules(rules, makeContext('d','x', {}));
    expect(res).toHaveLength(3); res.forEach(r => expect(r.status).toBe('fail'));
  });
  it('batch 4 failing', async () => {
    const rules = Array.from({ length: 4 }, (_, i) => makeRule('r' + i, 'R' + i, 'CUSTOM', '1', 'major', () => false, true));
    const res = await evaluateRules(rules, makeContext('d','x', {}));
    expect(res).toHaveLength(4); res.forEach(r => expect(r.status).toBe('fail'));
  });
  it('batch 5 failing', async () => {
    const rules = Array.from({ length: 5 }, (_, i) => makeRule('r' + i, 'R' + i, 'CUSTOM', '1', 'major', () => false, true));
    const res = await evaluateRules(rules, makeContext('d','x', {}));
    expect(res).toHaveLength(5); res.forEach(r => expect(r.status).toBe('fail'));
  });
  it('batch 6 failing', async () => {
    const rules = Array.from({ length: 6 }, (_, i) => makeRule('r' + i, 'R' + i, 'CUSTOM', '1', 'major', () => false, true));
    const res = await evaluateRules(rules, makeContext('d','x', {}));
    expect(res).toHaveLength(6); res.forEach(r => expect(r.status).toBe('fail'));
  });
  it('batch 7 failing', async () => {
    const rules = Array.from({ length: 7 }, (_, i) => makeRule('r' + i, 'R' + i, 'CUSTOM', '1', 'major', () => false, true));
    const res = await evaluateRules(rules, makeContext('d','x', {}));
    expect(res).toHaveLength(7); res.forEach(r => expect(r.status).toBe('fail'));
  });
  it('batch 8 failing', async () => {
    const rules = Array.from({ length: 8 }, (_, i) => makeRule('r' + i, 'R' + i, 'CUSTOM', '1', 'major', () => false, true));
    const res = await evaluateRules(rules, makeContext('d','x', {}));
    expect(res).toHaveLength(8); res.forEach(r => expect(r.status).toBe('fail'));
  });
  it('batch 9 failing', async () => {
    const rules = Array.from({ length: 9 }, (_, i) => makeRule('r' + i, 'R' + i, 'CUSTOM', '1', 'major', () => false, true));
    const res = await evaluateRules(rules, makeContext('d','x', {}));
    expect(res).toHaveLength(9); res.forEach(r => expect(r.status).toBe('fail'));
  });
  it('batch 10 failing', async () => {
    const rules = Array.from({ length: 10 }, (_, i) => makeRule('r' + i, 'R' + i, 'CUSTOM', '1', 'major', () => false, true));
    const res = await evaluateRules(rules, makeContext('d','x', {}));
    expect(res).toHaveLength(10); res.forEach(r => expect(r.status).toBe('fail'));
  });
  it('batch 11 failing', async () => {
    const rules = Array.from({ length: 11 }, (_, i) => makeRule('r' + i, 'R' + i, 'CUSTOM', '1', 'major', () => false, true));
    const res = await evaluateRules(rules, makeContext('d','x', {}));
    expect(res).toHaveLength(11); res.forEach(r => expect(r.status).toBe('fail'));
  });
  it('batch 12 failing', async () => {
    const rules = Array.from({ length: 12 }, (_, i) => makeRule('r' + i, 'R' + i, 'CUSTOM', '1', 'major', () => false, true));
    const res = await evaluateRules(rules, makeContext('d','x', {}));
    expect(res).toHaveLength(12); res.forEach(r => expect(r.status).toBe('fail'));
  });
  it('batch 13 failing', async () => {
    const rules = Array.from({ length: 13 }, (_, i) => makeRule('r' + i, 'R' + i, 'CUSTOM', '1', 'major', () => false, true));
    const res = await evaluateRules(rules, makeContext('d','x', {}));
    expect(res).toHaveLength(13); res.forEach(r => expect(r.status).toBe('fail'));
  });
  it('batch 14 failing', async () => {
    const rules = Array.from({ length: 14 }, (_, i) => makeRule('r' + i, 'R' + i, 'CUSTOM', '1', 'major', () => false, true));
    const res = await evaluateRules(rules, makeContext('d','x', {}));
    expect(res).toHaveLength(14); res.forEach(r => expect(r.status).toBe('fail'));
  });
  it('batch 15 failing', async () => {
    const rules = Array.from({ length: 15 }, (_, i) => makeRule('r' + i, 'R' + i, 'CUSTOM', '1', 'major', () => false, true));
    const res = await evaluateRules(rules, makeContext('d','x', {}));
    expect(res).toHaveLength(15); res.forEach(r => expect(r.status).toBe('fail'));
  });
  it('batch 16 failing', async () => {
    const rules = Array.from({ length: 16 }, (_, i) => makeRule('r' + i, 'R' + i, 'CUSTOM', '1', 'major', () => false, true));
    const res = await evaluateRules(rules, makeContext('d','x', {}));
    expect(res).toHaveLength(16); res.forEach(r => expect(r.status).toBe('fail'));
  });
  it('batch 17 failing', async () => {
    const rules = Array.from({ length: 17 }, (_, i) => makeRule('r' + i, 'R' + i, 'CUSTOM', '1', 'major', () => false, true));
    const res = await evaluateRules(rules, makeContext('d','x', {}));
    expect(res).toHaveLength(17); res.forEach(r => expect(r.status).toBe('fail'));
  });
  it('batch 18 failing', async () => {
    const rules = Array.from({ length: 18 }, (_, i) => makeRule('r' + i, 'R' + i, 'CUSTOM', '1', 'major', () => false, true));
    const res = await evaluateRules(rules, makeContext('d','x', {}));
    expect(res).toHaveLength(18); res.forEach(r => expect(r.status).toBe('fail'));
  });
  it('batch 19 failing', async () => {
    const rules = Array.from({ length: 19 }, (_, i) => makeRule('r' + i, 'R' + i, 'CUSTOM', '1', 'major', () => false, true));
    const res = await evaluateRules(rules, makeContext('d','x', {}));
    expect(res).toHaveLength(19); res.forEach(r => expect(r.status).toBe('fail'));
  });
  it('batch 20 failing', async () => {
    const rules = Array.from({ length: 20 }, (_, i) => makeRule('r' + i, 'R' + i, 'CUSTOM', '1', 'major', () => false, true));
    const res = await evaluateRules(rules, makeContext('d','x', {}));
    expect(res).toHaveLength(20); res.forEach(r => expect(r.status).toBe('fail'));
  });
  it('empty rules returns empty', async () => {
    expect(await evaluateRules([], makeContext('t','e', {}))).toHaveLength(0);
  });
  it('preserves order', async () => {
    const rules = ['a','b','c'].map(id => makeRule(id, id, 'CUSTOM', '1', 'minor', () => true));
    const res = await evaluateRules(rules, makeContext('t','e', {}));
    expect(res.map(r => r.ruleId)).toEqual(['a','b','c']);
  });
  it('mix pass fail warn', async () => {
    const rules = [
      makeRule('r1','p','CUSTOM','1','minor', () => true),
      makeRule('r2','f','CUSTOM','1','major', () => false, true),
      makeRule('r3','w','CUSTOM','1','info', () => false, false),
    ];
    const res = await evaluateRules(rules, makeContext('t','e', {}));
    expect(res[0].status).toBe('pass');
    expect(res[1].status).toBe('fail');
    expect(res[2].status).toBe('warning');
  });
});

describe('generateReport', () => {
  it('empty results score 100', () => {
    const r = generateReport('doc','d1', []);
    expect(r.score).toBe(100); expect(r.isCompliant).toBe(true); expect(r.total).toBe(0);
  });
  it('all pass score 100', () => {
    const res = [makeResult('r1','pass'), makeResult('r2','pass')];
    const r = generateReport('doc','d1', res);
    expect(r.score).toBe(100); expect(r.passed).toBe(2); expect(r.failed).toBe(0);
  });
  it('all fail score 0', () => {
    const res = [makeResult('r1','fail'), makeResult('r2','fail')];
    const r = generateReport('doc','d1', res);
    expect(r.score).toBe(0); expect(r.isCompliant).toBe(false); expect(r.failed).toBe(2);
  });
  it('half pass score 50', () => {
    const res = [makeResult('r1','pass'), makeResult('r2','fail')];
    expect(generateReport('doc','d1', res).score).toBe(50);
  });
  it('stores entityType entityId', () => {
    const r = generateReport('incident','inc-42', []);
    expect(r.entityType).toBe('incident'); expect(r.entityId).toBe('inc-42');
  });
  it('stores standard', () => { expect(generateReport('d','e', [], 'ISO_9001').standard).toBe('ISO_9001'); });
  it('standard undefined without arg', () => { expect(generateReport('d','e', []).standard).toBeUndefined(); });
  it('timestamp is number', () => { expect(typeof generateReport('d','e', []).timestamp).toBe('number'); });
  it('counts warnings', () => {
    const res = [makeResult('r1','warning'), makeResult('r2','warning'), makeResult('r3','pass')];
    const r = generateReport('d','e', res);
    expect(r.warnings).toBe(2); expect(r.passed).toBe(1);
  });
  it('total equals length', () => {
    const res = Array.from({ length: 7 }, (_, i) => makeResult('r' + i, 'pass'));
    expect(generateReport('d','e', res).total).toBe(7);
  });
  it('score 0 for 0/10 pass', () => {
    const res = [...Array.from({ length: 0 }, (_, i) => makeResult('p' + i, 'pass')), ...Array.from({ length: 10 }, (_, i) => makeResult('f' + i, 'fail'))];
    const r = generateReport('d','e', res);
    expect(r.score).toBe(0); expect(r.isCompliant).toBe(false);
  });
  it('score 10 for 1/10 pass', () => {
    const res = [...Array.from({ length: 1 }, (_, i) => makeResult('p' + i, 'pass')), ...Array.from({ length: 9 }, (_, i) => makeResult('f' + i, 'fail'))];
    const r = generateReport('d','e', res);
    expect(r.score).toBe(10); expect(r.isCompliant).toBe(false);
  });
  it('score 20 for 2/10 pass', () => {
    const res = [...Array.from({ length: 2 }, (_, i) => makeResult('p' + i, 'pass')), ...Array.from({ length: 8 }, (_, i) => makeResult('f' + i, 'fail'))];
    const r = generateReport('d','e', res);
    expect(r.score).toBe(20); expect(r.isCompliant).toBe(false);
  });
  it('score 30 for 3/10 pass', () => {
    const res = [...Array.from({ length: 3 }, (_, i) => makeResult('p' + i, 'pass')), ...Array.from({ length: 7 }, (_, i) => makeResult('f' + i, 'fail'))];
    const r = generateReport('d','e', res);
    expect(r.score).toBe(30); expect(r.isCompliant).toBe(false);
  });
  it('score 40 for 4/10 pass', () => {
    const res = [...Array.from({ length: 4 }, (_, i) => makeResult('p' + i, 'pass')), ...Array.from({ length: 6 }, (_, i) => makeResult('f' + i, 'fail'))];
    const r = generateReport('d','e', res);
    expect(r.score).toBe(40); expect(r.isCompliant).toBe(false);
  });
  it('score 50 for 5/10 pass', () => {
    const res = [...Array.from({ length: 5 }, (_, i) => makeResult('p' + i, 'pass')), ...Array.from({ length: 5 }, (_, i) => makeResult('f' + i, 'fail'))];
    const r = generateReport('d','e', res);
    expect(r.score).toBe(50); expect(r.isCompliant).toBe(false);
  });
  it('score 60 for 6/10 pass', () => {
    const res = [...Array.from({ length: 6 }, (_, i) => makeResult('p' + i, 'pass')), ...Array.from({ length: 4 }, (_, i) => makeResult('f' + i, 'fail'))];
    const r = generateReport('d','e', res);
    expect(r.score).toBe(60); expect(r.isCompliant).toBe(false);
  });
  it('score 70 for 7/10 pass', () => {
    const res = [...Array.from({ length: 7 }, (_, i) => makeResult('p' + i, 'pass')), ...Array.from({ length: 3 }, (_, i) => makeResult('f' + i, 'fail'))];
    const r = generateReport('d','e', res);
    expect(r.score).toBe(70); expect(r.isCompliant).toBe(false);
  });
  it('score 80 for 8/10 pass', () => {
    const res = [...Array.from({ length: 8 }, (_, i) => makeResult('p' + i, 'pass')), ...Array.from({ length: 2 }, (_, i) => makeResult('f' + i, 'fail'))];
    const r = generateReport('d','e', res);
    expect(r.score).toBe(80); expect(r.isCompliant).toBe(false);
  });
  it('score 90 for 9/10 pass', () => {
    const res = [...Array.from({ length: 9 }, (_, i) => makeResult('p' + i, 'pass')), ...Array.from({ length: 1 }, (_, i) => makeResult('f' + i, 'fail'))];
    const r = generateReport('d','e', res);
    expect(r.score).toBe(90); expect(r.isCompliant).toBe(false);
  });
  it('score 100 for 10/10 pass', () => {
    const res = [...Array.from({ length: 10 }, (_, i) => makeResult('p' + i, 'pass')), ...Array.from({ length: 0 }, (_, i) => makeResult('f' + i, 'fail'))];
    const r = generateReport('d','e', res);
    expect(r.score).toBe(100); expect(r.isCompliant).toBe(true);
  });
  standards.forEach(std => {
    it('standard: ' + std, () => { expect(generateReport('d','e', [], std).standard).toBe(std); });
  });
});

describe('filterByStatus', () => {
  statuses.forEach(status => {
    it('filterByStatus: ' + status, () => {
      const results = statuses.map(s => makeResult('r_' + s, s));
      const filtered = filterByStatus(results, status);
      expect(filtered).toHaveLength(1); expect(filtered[0].status).toBe(status);
    });
  });
  it('filterByStatus pass from mixed 0', () => {
    const results = [makeResult('p0','pass'), makeResult('f0','fail'), makeResult('w0','warning')];
    const filtered = filterByStatus(results, 'pass');
    expect(filtered).toHaveLength(1); expect(filtered[0].ruleId).toBe('p0');
  });
  it('filterByStatus pass from mixed 1', () => {
    const results = [makeResult('p1','pass'), makeResult('f1','fail'), makeResult('w1','warning')];
    const filtered = filterByStatus(results, 'pass');
    expect(filtered).toHaveLength(1); expect(filtered[0].ruleId).toBe('p1');
  });
  it('filterByStatus pass from mixed 2', () => {
    const results = [makeResult('p2','pass'), makeResult('f2','fail'), makeResult('w2','warning')];
    const filtered = filterByStatus(results, 'pass');
    expect(filtered).toHaveLength(1); expect(filtered[0].ruleId).toBe('p2');
  });
  it('filterByStatus pass from mixed 3', () => {
    const results = [makeResult('p3','pass'), makeResult('f3','fail'), makeResult('w3','warning')];
    const filtered = filterByStatus(results, 'pass');
    expect(filtered).toHaveLength(1); expect(filtered[0].ruleId).toBe('p3');
  });
  it('filterByStatus pass from mixed 4', () => {
    const results = [makeResult('p4','pass'), makeResult('f4','fail'), makeResult('w4','warning')];
    const filtered = filterByStatus(results, 'pass');
    expect(filtered).toHaveLength(1); expect(filtered[0].ruleId).toBe('p4');
  });
  it('filterByStatus pass from mixed 5', () => {
    const results = [makeResult('p5','pass'), makeResult('f5','fail'), makeResult('w5','warning')];
    const filtered = filterByStatus(results, 'pass');
    expect(filtered).toHaveLength(1); expect(filtered[0].ruleId).toBe('p5');
  });
  it('filterByStatus pass from mixed 6', () => {
    const results = [makeResult('p6','pass'), makeResult('f6','fail'), makeResult('w6','warning')];
    const filtered = filterByStatus(results, 'pass');
    expect(filtered).toHaveLength(1); expect(filtered[0].ruleId).toBe('p6');
  });
  it('filterByStatus pass from mixed 7', () => {
    const results = [makeResult('p7','pass'), makeResult('f7','fail'), makeResult('w7','warning')];
    const filtered = filterByStatus(results, 'pass');
    expect(filtered).toHaveLength(1); expect(filtered[0].ruleId).toBe('p7');
  });
  it('filterByStatus pass from mixed 8', () => {
    const results = [makeResult('p8','pass'), makeResult('f8','fail'), makeResult('w8','warning')];
    const filtered = filterByStatus(results, 'pass');
    expect(filtered).toHaveLength(1); expect(filtered[0].ruleId).toBe('p8');
  });
  it('filterByStatus pass from mixed 9', () => {
    const results = [makeResult('p9','pass'), makeResult('f9','fail'), makeResult('w9','warning')];
    const filtered = filterByStatus(results, 'pass');
    expect(filtered).toHaveLength(1); expect(filtered[0].ruleId).toBe('p9');
  });
  it('filterByStatus pass from mixed 10', () => {
    const results = [makeResult('p10','pass'), makeResult('f10','fail'), makeResult('w10','warning')];
    const filtered = filterByStatus(results, 'pass');
    expect(filtered).toHaveLength(1); expect(filtered[0].ruleId).toBe('p10');
  });
  it('filterByStatus pass from mixed 11', () => {
    const results = [makeResult('p11','pass'), makeResult('f11','fail'), makeResult('w11','warning')];
    const filtered = filterByStatus(results, 'pass');
    expect(filtered).toHaveLength(1); expect(filtered[0].ruleId).toBe('p11');
  });
  it('filterByStatus pass from mixed 12', () => {
    const results = [makeResult('p12','pass'), makeResult('f12','fail'), makeResult('w12','warning')];
    const filtered = filterByStatus(results, 'pass');
    expect(filtered).toHaveLength(1); expect(filtered[0].ruleId).toBe('p12');
  });
  it('filterByStatus pass from mixed 13', () => {
    const results = [makeResult('p13','pass'), makeResult('f13','fail'), makeResult('w13','warning')];
    const filtered = filterByStatus(results, 'pass');
    expect(filtered).toHaveLength(1); expect(filtered[0].ruleId).toBe('p13');
  });
  it('filterByStatus pass from mixed 14', () => {
    const results = [makeResult('p14','pass'), makeResult('f14','fail'), makeResult('w14','warning')];
    const filtered = filterByStatus(results, 'pass');
    expect(filtered).toHaveLength(1); expect(filtered[0].ruleId).toBe('p14');
  });
  it('filterByStatus pass from mixed 15', () => {
    const results = [makeResult('p15','pass'), makeResult('f15','fail'), makeResult('w15','warning')];
    const filtered = filterByStatus(results, 'pass');
    expect(filtered).toHaveLength(1); expect(filtered[0].ruleId).toBe('p15');
  });
  it('filterByStatus pass from mixed 16', () => {
    const results = [makeResult('p16','pass'), makeResult('f16','fail'), makeResult('w16','warning')];
    const filtered = filterByStatus(results, 'pass');
    expect(filtered).toHaveLength(1); expect(filtered[0].ruleId).toBe('p16');
  });
  it('filterByStatus pass from mixed 17', () => {
    const results = [makeResult('p17','pass'), makeResult('f17','fail'), makeResult('w17','warning')];
    const filtered = filterByStatus(results, 'pass');
    expect(filtered).toHaveLength(1); expect(filtered[0].ruleId).toBe('p17');
  });
  it('filterByStatus pass from mixed 18', () => {
    const results = [makeResult('p18','pass'), makeResult('f18','fail'), makeResult('w18','warning')];
    const filtered = filterByStatus(results, 'pass');
    expect(filtered).toHaveLength(1); expect(filtered[0].ruleId).toBe('p18');
  });
  it('filterByStatus pass from mixed 19', () => {
    const results = [makeResult('p19','pass'), makeResult('f19','fail'), makeResult('w19','warning')];
    const filtered = filterByStatus(results, 'pass');
    expect(filtered).toHaveLength(1); expect(filtered[0].ruleId).toBe('p19');
  });
  it('returns empty when no match', () => { expect(filterByStatus([makeResult('r1','pass')], 'fail')).toHaveLength(0); });
  it('returns all when all match', () => { expect(filterByStatus([makeResult('r1','fail'), makeResult('r2','fail')], 'fail')).toHaveLength(2); });
  it('handles empty input', () => { expect(filterByStatus([], 'pass')).toHaveLength(0); });
});

describe('filterBySeverity', () => {
  severities.forEach(sev => {
    it('filterBySeverity: ' + sev, () => {
      const results = severities.map(s => makeResult('r_' + s, 'pass', s));
      const filtered = filterBySeverity(results, sev);
      expect(filtered).toHaveLength(1); expect(filtered[0].severity).toBe(sev);
    });
  });
  it('filterBySeverity critical 0', () => {
    const results = [makeResult('c0','fail','critical'), makeResult('m0','fail','minor')];
    const filtered = filterBySeverity(results, 'critical');
    expect(filtered).toHaveLength(1); expect(filtered[0].severity).toBe('critical');
  });
  it('filterBySeverity critical 1', () => {
    const results = [makeResult('c1','fail','critical'), makeResult('m1','fail','minor')];
    const filtered = filterBySeverity(results, 'critical');
    expect(filtered).toHaveLength(1); expect(filtered[0].severity).toBe('critical');
  });
  it('filterBySeverity critical 2', () => {
    const results = [makeResult('c2','fail','critical'), makeResult('m2','fail','minor')];
    const filtered = filterBySeverity(results, 'critical');
    expect(filtered).toHaveLength(1); expect(filtered[0].severity).toBe('critical');
  });
  it('filterBySeverity critical 3', () => {
    const results = [makeResult('c3','fail','critical'), makeResult('m3','fail','minor')];
    const filtered = filterBySeverity(results, 'critical');
    expect(filtered).toHaveLength(1); expect(filtered[0].severity).toBe('critical');
  });
  it('filterBySeverity critical 4', () => {
    const results = [makeResult('c4','fail','critical'), makeResult('m4','fail','minor')];
    const filtered = filterBySeverity(results, 'critical');
    expect(filtered).toHaveLength(1); expect(filtered[0].severity).toBe('critical');
  });
  it('filterBySeverity critical 5', () => {
    const results = [makeResult('c5','fail','critical'), makeResult('m5','fail','minor')];
    const filtered = filterBySeverity(results, 'critical');
    expect(filtered).toHaveLength(1); expect(filtered[0].severity).toBe('critical');
  });
  it('filterBySeverity critical 6', () => {
    const results = [makeResult('c6','fail','critical'), makeResult('m6','fail','minor')];
    const filtered = filterBySeverity(results, 'critical');
    expect(filtered).toHaveLength(1); expect(filtered[0].severity).toBe('critical');
  });
  it('filterBySeverity critical 7', () => {
    const results = [makeResult('c7','fail','critical'), makeResult('m7','fail','minor')];
    const filtered = filterBySeverity(results, 'critical');
    expect(filtered).toHaveLength(1); expect(filtered[0].severity).toBe('critical');
  });
  it('filterBySeverity critical 8', () => {
    const results = [makeResult('c8','fail','critical'), makeResult('m8','fail','minor')];
    const filtered = filterBySeverity(results, 'critical');
    expect(filtered).toHaveLength(1); expect(filtered[0].severity).toBe('critical');
  });
  it('filterBySeverity critical 9', () => {
    const results = [makeResult('c9','fail','critical'), makeResult('m9','fail','minor')];
    const filtered = filterBySeverity(results, 'critical');
    expect(filtered).toHaveLength(1); expect(filtered[0].severity).toBe('critical');
  });
  it('filterBySeverity critical 10', () => {
    const results = [makeResult('c10','fail','critical'), makeResult('m10','fail','minor')];
    const filtered = filterBySeverity(results, 'critical');
    expect(filtered).toHaveLength(1); expect(filtered[0].severity).toBe('critical');
  });
  it('filterBySeverity critical 11', () => {
    const results = [makeResult('c11','fail','critical'), makeResult('m11','fail','minor')];
    const filtered = filterBySeverity(results, 'critical');
    expect(filtered).toHaveLength(1); expect(filtered[0].severity).toBe('critical');
  });
  it('filterBySeverity critical 12', () => {
    const results = [makeResult('c12','fail','critical'), makeResult('m12','fail','minor')];
    const filtered = filterBySeverity(results, 'critical');
    expect(filtered).toHaveLength(1); expect(filtered[0].severity).toBe('critical');
  });
  it('filterBySeverity critical 13', () => {
    const results = [makeResult('c13','fail','critical'), makeResult('m13','fail','minor')];
    const filtered = filterBySeverity(results, 'critical');
    expect(filtered).toHaveLength(1); expect(filtered[0].severity).toBe('critical');
  });
  it('filterBySeverity critical 14', () => {
    const results = [makeResult('c14','fail','critical'), makeResult('m14','fail','minor')];
    const filtered = filterBySeverity(results, 'critical');
    expect(filtered).toHaveLength(1); expect(filtered[0].severity).toBe('critical');
  });
  it('filterBySeverity critical 15', () => {
    const results = [makeResult('c15','fail','critical'), makeResult('m15','fail','minor')];
    const filtered = filterBySeverity(results, 'critical');
    expect(filtered).toHaveLength(1); expect(filtered[0].severity).toBe('critical');
  });
  it('filterBySeverity critical 16', () => {
    const results = [makeResult('c16','fail','critical'), makeResult('m16','fail','minor')];
    const filtered = filterBySeverity(results, 'critical');
    expect(filtered).toHaveLength(1); expect(filtered[0].severity).toBe('critical');
  });
  it('filterBySeverity critical 17', () => {
    const results = [makeResult('c17','fail','critical'), makeResult('m17','fail','minor')];
    const filtered = filterBySeverity(results, 'critical');
    expect(filtered).toHaveLength(1); expect(filtered[0].severity).toBe('critical');
  });
  it('filterBySeverity critical 18', () => {
    const results = [makeResult('c18','fail','critical'), makeResult('m18','fail','minor')];
    const filtered = filterBySeverity(results, 'critical');
    expect(filtered).toHaveLength(1); expect(filtered[0].severity).toBe('critical');
  });
  it('filterBySeverity critical 19', () => {
    const results = [makeResult('c19','fail','critical'), makeResult('m19','fail','minor')];
    const filtered = filterBySeverity(results, 'critical');
    expect(filtered).toHaveLength(1); expect(filtered[0].severity).toBe('critical');
  });
  it('returns empty when no match', () => { expect(filterBySeverity([makeResult('r1','pass','info')], 'critical')).toHaveLength(0); });
  it('returns all when all match', () => { expect(filterBySeverity([makeResult('r1','pass','major'), makeResult('r2','fail','major')], 'major')).toHaveLength(2); });
  it('handles empty input', () => { expect(filterBySeverity([], 'minor')).toHaveLength(0); });
});

describe('filterByStandard', () => {
  standards.forEach(std => {
    it('filterByStandard: ' + std, () => {
      const rules = standards.map(s => makeRule('r_' + s, 'n', s, '1', 'minor', () => true));
      const filtered = filterByStandard(rules, std);
      expect(filtered).toHaveLength(1); expect(filtered[0].standard).toBe(std);
    });
  });
  it('filterByStandard ISO_9001 0', () => {
    const rules = [makeRule('a0','A','ISO_9001','1','minor', () => true), makeRule('b0','B','GDPR','1','minor', () => true)];
    expect(filterByStandard(rules, 'ISO_9001')).toHaveLength(1);
  });
  it('filterByStandard ISO_9001 1', () => {
    const rules = [makeRule('a1','A','ISO_9001','1','minor', () => true), makeRule('b1','B','GDPR','1','minor', () => true)];
    expect(filterByStandard(rules, 'ISO_9001')).toHaveLength(1);
  });
  it('filterByStandard ISO_9001 2', () => {
    const rules = [makeRule('a2','A','ISO_9001','1','minor', () => true), makeRule('b2','B','GDPR','1','minor', () => true)];
    expect(filterByStandard(rules, 'ISO_9001')).toHaveLength(1);
  });
  it('filterByStandard ISO_9001 3', () => {
    const rules = [makeRule('a3','A','ISO_9001','1','minor', () => true), makeRule('b3','B','GDPR','1','minor', () => true)];
    expect(filterByStandard(rules, 'ISO_9001')).toHaveLength(1);
  });
  it('filterByStandard ISO_9001 4', () => {
    const rules = [makeRule('a4','A','ISO_9001','1','minor', () => true), makeRule('b4','B','GDPR','1','minor', () => true)];
    expect(filterByStandard(rules, 'ISO_9001')).toHaveLength(1);
  });
  it('filterByStandard ISO_9001 5', () => {
    const rules = [makeRule('a5','A','ISO_9001','1','minor', () => true), makeRule('b5','B','GDPR','1','minor', () => true)];
    expect(filterByStandard(rules, 'ISO_9001')).toHaveLength(1);
  });
  it('filterByStandard ISO_9001 6', () => {
    const rules = [makeRule('a6','A','ISO_9001','1','minor', () => true), makeRule('b6','B','GDPR','1','minor', () => true)];
    expect(filterByStandard(rules, 'ISO_9001')).toHaveLength(1);
  });
  it('filterByStandard ISO_9001 7', () => {
    const rules = [makeRule('a7','A','ISO_9001','1','minor', () => true), makeRule('b7','B','GDPR','1','minor', () => true)];
    expect(filterByStandard(rules, 'ISO_9001')).toHaveLength(1);
  });
  it('filterByStandard ISO_9001 8', () => {
    const rules = [makeRule('a8','A','ISO_9001','1','minor', () => true), makeRule('b8','B','GDPR','1','minor', () => true)];
    expect(filterByStandard(rules, 'ISO_9001')).toHaveLength(1);
  });
  it('filterByStandard ISO_9001 9', () => {
    const rules = [makeRule('a9','A','ISO_9001','1','minor', () => true), makeRule('b9','B','GDPR','1','minor', () => true)];
    expect(filterByStandard(rules, 'ISO_9001')).toHaveLength(1);
  });
  it('filterByStandard ISO_9001 10', () => {
    const rules = [makeRule('a10','A','ISO_9001','1','minor', () => true), makeRule('b10','B','GDPR','1','minor', () => true)];
    expect(filterByStandard(rules, 'ISO_9001')).toHaveLength(1);
  });
  it('filterByStandard ISO_9001 11', () => {
    const rules = [makeRule('a11','A','ISO_9001','1','minor', () => true), makeRule('b11','B','GDPR','1','minor', () => true)];
    expect(filterByStandard(rules, 'ISO_9001')).toHaveLength(1);
  });
  it('filterByStandard ISO_9001 12', () => {
    const rules = [makeRule('a12','A','ISO_9001','1','minor', () => true), makeRule('b12','B','GDPR','1','minor', () => true)];
    expect(filterByStandard(rules, 'ISO_9001')).toHaveLength(1);
  });
  it('filterByStandard ISO_9001 13', () => {
    const rules = [makeRule('a13','A','ISO_9001','1','minor', () => true), makeRule('b13','B','GDPR','1','minor', () => true)];
    expect(filterByStandard(rules, 'ISO_9001')).toHaveLength(1);
  });
  it('filterByStandard ISO_9001 14', () => {
    const rules = [makeRule('a14','A','ISO_9001','1','minor', () => true), makeRule('b14','B','GDPR','1','minor', () => true)];
    expect(filterByStandard(rules, 'ISO_9001')).toHaveLength(1);
  });
  it('filterByStandard ISO_9001 15', () => {
    const rules = [makeRule('a15','A','ISO_9001','1','minor', () => true), makeRule('b15','B','GDPR','1','minor', () => true)];
    expect(filterByStandard(rules, 'ISO_9001')).toHaveLength(1);
  });
  it('filterByStandard ISO_9001 16', () => {
    const rules = [makeRule('a16','A','ISO_9001','1','minor', () => true), makeRule('b16','B','GDPR','1','minor', () => true)];
    expect(filterByStandard(rules, 'ISO_9001')).toHaveLength(1);
  });
  it('filterByStandard ISO_9001 17', () => {
    const rules = [makeRule('a17','A','ISO_9001','1','minor', () => true), makeRule('b17','B','GDPR','1','minor', () => true)];
    expect(filterByStandard(rules, 'ISO_9001')).toHaveLength(1);
  });
  it('filterByStandard ISO_9001 18', () => {
    const rules = [makeRule('a18','A','ISO_9001','1','minor', () => true), makeRule('b18','B','GDPR','1','minor', () => true)];
    expect(filterByStandard(rules, 'ISO_9001')).toHaveLength(1);
  });
  it('filterByStandard ISO_9001 19', () => {
    const rules = [makeRule('a19','A','ISO_9001','1','minor', () => true), makeRule('b19','B','GDPR','1','minor', () => true)];
    expect(filterByStandard(rules, 'ISO_9001')).toHaveLength(1);
  });
  it('returns empty when no match', () => {
    expect(filterByStandard([makeRule('r','n','GDPR','1','minor', () => true)], 'ISO_9001')).toHaveLength(0);
  });
  it('returns all matching', () => {
    const rules = [makeRule('r1','n','ISO_27001','1','minor', () => true), makeRule('r2','n','ISO_27001','2','major', () => true)];
    expect(filterByStandard(rules, 'ISO_27001')).toHaveLength(2);
  });
  it('handles empty input', () => { expect(filterByStandard([], 'ISO_9001')).toHaveLength(0); });
});

describe('mandatoryFailures', () => {
  it('returns only mandatory failed', () => {
    const rules = [makeRule('r1','n','CUSTOM','1','critical', () => false, true), makeRule('r2','n','CUSTOM','1','minor', () => false, false)];
    const results = [makeResult('r1','fail','critical'), makeResult('r2','fail','minor')];
    const mf = mandatoryFailures(results, rules);
    expect(mf).toHaveLength(1); expect(mf[0].ruleId).toBe('r1');
  });
  it('empty when no mandatory failures', () => {
    const rules = [makeRule('r1','n','CUSTOM','1','minor', () => true, true)];
    expect(mandatoryFailures([makeResult('r1','pass')], rules)).toHaveLength(0);
  });
  it('excludes passed mandatory', () => {
    const rules = [makeRule('r1','n','CUSTOM','1','critical', () => true, true), makeRule('r2','n','CUSTOM','1','critical', () => false, true)];
    const results = [makeResult('r1','pass','critical'), makeResult('r2','fail','critical')];
    expect(mandatoryFailures(results, rules)).toHaveLength(1);
  });
  it('empty when rules empty', () => { expect(mandatoryFailures([makeResult('r1','fail')], [])).toHaveLength(0); });
  it('empty when results empty', () => { expect(mandatoryFailures([], [makeRule('r','n','CUSTOM','1','critical', () => false, true)])).toHaveLength(0); });
  it('returns 1 failures', () => {
    const rules = Array.from({ length: 1 }, (_, i) => makeRule('r' + i, 'n', 'CUSTOM', '1', 'critical', () => false, true));
    const results = rules.map(r => makeResult(r.id, 'fail', 'critical'));
    expect(mandatoryFailures(results, rules)).toHaveLength(1);
  });
  it('returns 2 failures', () => {
    const rules = Array.from({ length: 2 }, (_, i) => makeRule('r' + i, 'n', 'CUSTOM', '1', 'critical', () => false, true));
    const results = rules.map(r => makeResult(r.id, 'fail', 'critical'));
    expect(mandatoryFailures(results, rules)).toHaveLength(2);
  });
  it('returns 3 failures', () => {
    const rules = Array.from({ length: 3 }, (_, i) => makeRule('r' + i, 'n', 'CUSTOM', '1', 'critical', () => false, true));
    const results = rules.map(r => makeResult(r.id, 'fail', 'critical'));
    expect(mandatoryFailures(results, rules)).toHaveLength(3);
  });
  it('returns 4 failures', () => {
    const rules = Array.from({ length: 4 }, (_, i) => makeRule('r' + i, 'n', 'CUSTOM', '1', 'critical', () => false, true));
    const results = rules.map(r => makeResult(r.id, 'fail', 'critical'));
    expect(mandatoryFailures(results, rules)).toHaveLength(4);
  });
  it('returns 5 failures', () => {
    const rules = Array.from({ length: 5 }, (_, i) => makeRule('r' + i, 'n', 'CUSTOM', '1', 'critical', () => false, true));
    const results = rules.map(r => makeResult(r.id, 'fail', 'critical'));
    expect(mandatoryFailures(results, rules)).toHaveLength(5);
  });
  it('returns 6 failures', () => {
    const rules = Array.from({ length: 6 }, (_, i) => makeRule('r' + i, 'n', 'CUSTOM', '1', 'critical', () => false, true));
    const results = rules.map(r => makeResult(r.id, 'fail', 'critical'));
    expect(mandatoryFailures(results, rules)).toHaveLength(6);
  });
  it('returns 7 failures', () => {
    const rules = Array.from({ length: 7 }, (_, i) => makeRule('r' + i, 'n', 'CUSTOM', '1', 'critical', () => false, true));
    const results = rules.map(r => makeResult(r.id, 'fail', 'critical'));
    expect(mandatoryFailures(results, rules)).toHaveLength(7);
  });
  it('returns 8 failures', () => {
    const rules = Array.from({ length: 8 }, (_, i) => makeRule('r' + i, 'n', 'CUSTOM', '1', 'critical', () => false, true));
    const results = rules.map(r => makeResult(r.id, 'fail', 'critical'));
    expect(mandatoryFailures(results, rules)).toHaveLength(8);
  });
  it('returns 9 failures', () => {
    const rules = Array.from({ length: 9 }, (_, i) => makeRule('r' + i, 'n', 'CUSTOM', '1', 'critical', () => false, true));
    const results = rules.map(r => makeResult(r.id, 'fail', 'critical'));
    expect(mandatoryFailures(results, rules)).toHaveLength(9);
  });
  it('returns 10 failures', () => {
    const rules = Array.from({ length: 10 }, (_, i) => makeRule('r' + i, 'n', 'CUSTOM', '1', 'critical', () => false, true));
    const results = rules.map(r => makeResult(r.id, 'fail', 'critical'));
    expect(mandatoryFailures(results, rules)).toHaveLength(10);
  });
});

describe('hasBlockingFailure', () => {
  it('true when mandatory critical fails', () => {
    const rules = [makeRule('r1','n','CUSTOM','1','critical', () => false, true)];
    expect(hasBlockingFailure([makeResult('r1','fail','critical')], rules)).toBe(true);
  });
  it('false when mandatory major fails', () => {
    const rules = [makeRule('r1','n','CUSTOM','1','major', () => false, true)];
    expect(hasBlockingFailure([makeResult('r1','fail','major')], rules)).toBe(false);
  });
  it('false when no failures', () => {
    const rules = [makeRule('r1','n','CUSTOM','1','critical', () => true, true)];
    expect(hasBlockingFailure([makeResult('r1','pass','critical')], rules)).toBe(false);
  });
  it('false for non-mandatory critical', () => {
    const rules = [makeRule('r1','n','CUSTOM','1','critical', () => false, false)];
    expect(hasBlockingFailure([makeResult('r1','fail','critical')], rules)).toBe(false);
  });
  it('false for empty inputs', () => { expect(hasBlockingFailure([], [])).toBe(false); });
  it('blocking true scenario 0', () => {
    const rules = [makeRule('r0','n','CUSTOM','1','critical', () => false, true)];
    expect(hasBlockingFailure([makeResult('r0','fail','critical')], rules)).toBe(true);
  });
  it('blocking true scenario 1', () => {
    const rules = [makeRule('r1','n','CUSTOM','1','critical', () => false, true)];
    expect(hasBlockingFailure([makeResult('r1','fail','critical')], rules)).toBe(true);
  });
  it('blocking true scenario 2', () => {
    const rules = [makeRule('r2','n','CUSTOM','1','critical', () => false, true)];
    expect(hasBlockingFailure([makeResult('r2','fail','critical')], rules)).toBe(true);
  });
  it('blocking true scenario 3', () => {
    const rules = [makeRule('r3','n','CUSTOM','1','critical', () => false, true)];
    expect(hasBlockingFailure([makeResult('r3','fail','critical')], rules)).toBe(true);
  });
  it('blocking true scenario 4', () => {
    const rules = [makeRule('r4','n','CUSTOM','1','critical', () => false, true)];
    expect(hasBlockingFailure([makeResult('r4','fail','critical')], rules)).toBe(true);
  });
  it('blocking true scenario 5', () => {
    const rules = [makeRule('r5','n','CUSTOM','1','critical', () => false, true)];
    expect(hasBlockingFailure([makeResult('r5','fail','critical')], rules)).toBe(true);
  });
  it('blocking true scenario 6', () => {
    const rules = [makeRule('r6','n','CUSTOM','1','critical', () => false, true)];
    expect(hasBlockingFailure([makeResult('r6','fail','critical')], rules)).toBe(true);
  });
  it('blocking true scenario 7', () => {
    const rules = [makeRule('r7','n','CUSTOM','1','critical', () => false, true)];
    expect(hasBlockingFailure([makeResult('r7','fail','critical')], rules)).toBe(true);
  });
  it('blocking true scenario 8', () => {
    const rules = [makeRule('r8','n','CUSTOM','1','critical', () => false, true)];
    expect(hasBlockingFailure([makeResult('r8','fail','critical')], rules)).toBe(true);
  });
  it('blocking true scenario 9', () => {
    const rules = [makeRule('r9','n','CUSTOM','1','critical', () => false, true)];
    expect(hasBlockingFailure([makeResult('r9','fail','critical')], rules)).toBe(true);
  });
  it('blocking true scenario 10', () => {
    const rules = [makeRule('r10','n','CUSTOM','1','critical', () => false, true)];
    expect(hasBlockingFailure([makeResult('r10','fail','critical')], rules)).toBe(true);
  });
  it('blocking true scenario 11', () => {
    const rules = [makeRule('r11','n','CUSTOM','1','critical', () => false, true)];
    expect(hasBlockingFailure([makeResult('r11','fail','critical')], rules)).toBe(true);
  });
  it('blocking true scenario 12', () => {
    const rules = [makeRule('r12','n','CUSTOM','1','critical', () => false, true)];
    expect(hasBlockingFailure([makeResult('r12','fail','critical')], rules)).toBe(true);
  });
  it('blocking true scenario 13', () => {
    const rules = [makeRule('r13','n','CUSTOM','1','critical', () => false, true)];
    expect(hasBlockingFailure([makeResult('r13','fail','critical')], rules)).toBe(true);
  });
  it('blocking true scenario 14', () => {
    const rules = [makeRule('r14','n','CUSTOM','1','critical', () => false, true)];
    expect(hasBlockingFailure([makeResult('r14','fail','critical')], rules)).toBe(true);
  });
  it('blocking true scenario 15', () => {
    const rules = [makeRule('r15','n','CUSTOM','1','critical', () => false, true)];
    expect(hasBlockingFailure([makeResult('r15','fail','critical')], rules)).toBe(true);
  });
  it('blocking true scenario 16', () => {
    const rules = [makeRule('r16','n','CUSTOM','1','critical', () => false, true)];
    expect(hasBlockingFailure([makeResult('r16','fail','critical')], rules)).toBe(true);
  });
  it('blocking true scenario 17', () => {
    const rules = [makeRule('r17','n','CUSTOM','1','critical', () => false, true)];
    expect(hasBlockingFailure([makeResult('r17','fail','critical')], rules)).toBe(true);
  });
  it('blocking true scenario 18', () => {
    const rules = [makeRule('r18','n','CUSTOM','1','critical', () => false, true)];
    expect(hasBlockingFailure([makeResult('r18','fail','critical')], rules)).toBe(true);
  });
  it('blocking true scenario 19', () => {
    const rules = [makeRule('r19','n','CUSTOM','1','critical', () => false, true)];
    expect(hasBlockingFailure([makeResult('r19','fail','critical')], rules)).toBe(true);
  });
  it('blocking false minor 0', () => {
    const rules = [makeRule('r0','n','CUSTOM','1','minor', () => false, true)];
    expect(hasBlockingFailure([makeResult('r0','fail','minor')], rules)).toBe(false);
  });
  it('blocking false minor 1', () => {
    const rules = [makeRule('r1','n','CUSTOM','1','minor', () => false, true)];
    expect(hasBlockingFailure([makeResult('r1','fail','minor')], rules)).toBe(false);
  });
  it('blocking false minor 2', () => {
    const rules = [makeRule('r2','n','CUSTOM','1','minor', () => false, true)];
    expect(hasBlockingFailure([makeResult('r2','fail','minor')], rules)).toBe(false);
  });
  it('blocking false minor 3', () => {
    const rules = [makeRule('r3','n','CUSTOM','1','minor', () => false, true)];
    expect(hasBlockingFailure([makeResult('r3','fail','minor')], rules)).toBe(false);
  });
  it('blocking false minor 4', () => {
    const rules = [makeRule('r4','n','CUSTOM','1','minor', () => false, true)];
    expect(hasBlockingFailure([makeResult('r4','fail','minor')], rules)).toBe(false);
  });
  it('blocking false minor 5', () => {
    const rules = [makeRule('r5','n','CUSTOM','1','minor', () => false, true)];
    expect(hasBlockingFailure([makeResult('r5','fail','minor')], rules)).toBe(false);
  });
  it('blocking false minor 6', () => {
    const rules = [makeRule('r6','n','CUSTOM','1','minor', () => false, true)];
    expect(hasBlockingFailure([makeResult('r6','fail','minor')], rules)).toBe(false);
  });
  it('blocking false minor 7', () => {
    const rules = [makeRule('r7','n','CUSTOM','1','minor', () => false, true)];
    expect(hasBlockingFailure([makeResult('r7','fail','minor')], rules)).toBe(false);
  });
  it('blocking false minor 8', () => {
    const rules = [makeRule('r8','n','CUSTOM','1','minor', () => false, true)];
    expect(hasBlockingFailure([makeResult('r8','fail','minor')], rules)).toBe(false);
  });
  it('blocking false minor 9', () => {
    const rules = [makeRule('r9','n','CUSTOM','1','minor', () => false, true)];
    expect(hasBlockingFailure([makeResult('r9','fail','minor')], rules)).toBe(false);
  });
  it('blocking false minor 10', () => {
    const rules = [makeRule('r10','n','CUSTOM','1','minor', () => false, true)];
    expect(hasBlockingFailure([makeResult('r10','fail','minor')], rules)).toBe(false);
  });
  it('blocking false minor 11', () => {
    const rules = [makeRule('r11','n','CUSTOM','1','minor', () => false, true)];
    expect(hasBlockingFailure([makeResult('r11','fail','minor')], rules)).toBe(false);
  });
  it('blocking false minor 12', () => {
    const rules = [makeRule('r12','n','CUSTOM','1','minor', () => false, true)];
    expect(hasBlockingFailure([makeResult('r12','fail','minor')], rules)).toBe(false);
  });
  it('blocking false minor 13', () => {
    const rules = [makeRule('r13','n','CUSTOM','1','minor', () => false, true)];
    expect(hasBlockingFailure([makeResult('r13','fail','minor')], rules)).toBe(false);
  });
  it('blocking false minor 14', () => {
    const rules = [makeRule('r14','n','CUSTOM','1','minor', () => false, true)];
    expect(hasBlockingFailure([makeResult('r14','fail','minor')], rules)).toBe(false);
  });
  it('blocking false minor 15', () => {
    const rules = [makeRule('r15','n','CUSTOM','1','minor', () => false, true)];
    expect(hasBlockingFailure([makeResult('r15','fail','minor')], rules)).toBe(false);
  });
  it('blocking false minor 16', () => {
    const rules = [makeRule('r16','n','CUSTOM','1','minor', () => false, true)];
    expect(hasBlockingFailure([makeResult('r16','fail','minor')], rules)).toBe(false);
  });
  it('blocking false minor 17', () => {
    const rules = [makeRule('r17','n','CUSTOM','1','minor', () => false, true)];
    expect(hasBlockingFailure([makeResult('r17','fail','minor')], rules)).toBe(false);
  });
  it('blocking false minor 18', () => {
    const rules = [makeRule('r18','n','CUSTOM','1','minor', () => false, true)];
    expect(hasBlockingFailure([makeResult('r18','fail','minor')], rules)).toBe(false);
  });
  it('blocking false minor 19', () => {
    const rules = [makeRule('r19','n','CUSTOM','1','minor', () => false, true)];
    expect(hasBlockingFailure([makeResult('r19','fail','minor')], rules)).toBe(false);
  });
});

describe('runCompliance', () => {
  it('runs all rules no filter', async () => {
    const rules = standards.map(std => makeRule('r_' + std, 'n', std, '1', 'minor', () => true));
    const r = await runCompliance(rules, makeContext('d','e', {}));
    expect(r.total).toBe(rules.length); expect(r.isCompliant).toBe(true);
  });
  standards.forEach(std => {
    it('runCompliance filters: ' + std, async () => {
      const rules = standards.map(s => makeRule('r_' + s, 'n', s, '1', 'minor', () => true));
      const r = await runCompliance(rules, makeContext('d','e', {}), std);
      expect(r.total).toBeGreaterThanOrEqual(1); expect(r.standard).toBe(std);
    });
  });
  it('CUSTOM included when filtering', async () => {
    const rules = [makeRule('r1','n','ISO_9001','1','minor', () => true), makeRule('r2','n','CUSTOM','1','minor', () => true), makeRule('r3','n','GDPR','1','minor', () => true)];
    const r = await runCompliance(rules, makeContext('d','e', {}), 'ISO_9001');
    expect(r.total).toBe(2);
  });
  it('isCompliant false on fail', async () => {
    const rules = [makeRule('r1','n','CUSTOM','1','critical', () => false, true)];
    const r = await runCompliance(rules, makeContext('d','e', {}));
    expect(r.isCompliant).toBe(false); expect(r.failed).toBe(1);
  });
  it('empty rules score 100', async () => {
    const r = await runCompliance([], makeContext('d','e', {}));
    expect(r.total).toBe(0); expect(r.score).toBe(100);
  });
  it('entityType from context', async () => {
    const r = await runCompliance([], makeContext('audit','a1', {}));
    expect(r.entityType).toBe('audit');
  });
  it('entityId from context', async () => {
    const r = await runCompliance([], makeContext('doc','DOC-999', {}));
    expect(r.entityId).toBe('DOC-999');
  });
  it('all pass scenario 0', async () => {
    const rules = Array.from({ length: 5 }, (_, j) => makeRule('r' + j, 'R' + j, 'CUSTOM', '1', 'minor', () => true));
    const r = await runCompliance(rules, makeContext('t','e0', {}));
    expect(r.score).toBe(100); expect(r.isCompliant).toBe(true);
  });
  it('all pass scenario 1', async () => {
    const rules = Array.from({ length: 5 }, (_, j) => makeRule('r' + j, 'R' + j, 'CUSTOM', '1', 'minor', () => true));
    const r = await runCompliance(rules, makeContext('t','e1', {}));
    expect(r.score).toBe(100); expect(r.isCompliant).toBe(true);
  });
  it('all pass scenario 2', async () => {
    const rules = Array.from({ length: 5 }, (_, j) => makeRule('r' + j, 'R' + j, 'CUSTOM', '1', 'minor', () => true));
    const r = await runCompliance(rules, makeContext('t','e2', {}));
    expect(r.score).toBe(100); expect(r.isCompliant).toBe(true);
  });
  it('all pass scenario 3', async () => {
    const rules = Array.from({ length: 5 }, (_, j) => makeRule('r' + j, 'R' + j, 'CUSTOM', '1', 'minor', () => true));
    const r = await runCompliance(rules, makeContext('t','e3', {}));
    expect(r.score).toBe(100); expect(r.isCompliant).toBe(true);
  });
  it('all pass scenario 4', async () => {
    const rules = Array.from({ length: 5 }, (_, j) => makeRule('r' + j, 'R' + j, 'CUSTOM', '1', 'minor', () => true));
    const r = await runCompliance(rules, makeContext('t','e4', {}));
    expect(r.score).toBe(100); expect(r.isCompliant).toBe(true);
  });
  it('all pass scenario 5', async () => {
    const rules = Array.from({ length: 5 }, (_, j) => makeRule('r' + j, 'R' + j, 'CUSTOM', '1', 'minor', () => true));
    const r = await runCompliance(rules, makeContext('t','e5', {}));
    expect(r.score).toBe(100); expect(r.isCompliant).toBe(true);
  });
  it('all pass scenario 6', async () => {
    const rules = Array.from({ length: 5 }, (_, j) => makeRule('r' + j, 'R' + j, 'CUSTOM', '1', 'minor', () => true));
    const r = await runCompliance(rules, makeContext('t','e6', {}));
    expect(r.score).toBe(100); expect(r.isCompliant).toBe(true);
  });
  it('all pass scenario 7', async () => {
    const rules = Array.from({ length: 5 }, (_, j) => makeRule('r' + j, 'R' + j, 'CUSTOM', '1', 'minor', () => true));
    const r = await runCompliance(rules, makeContext('t','e7', {}));
    expect(r.score).toBe(100); expect(r.isCompliant).toBe(true);
  });
  it('all pass scenario 8', async () => {
    const rules = Array.from({ length: 5 }, (_, j) => makeRule('r' + j, 'R' + j, 'CUSTOM', '1', 'minor', () => true));
    const r = await runCompliance(rules, makeContext('t','e8', {}));
    expect(r.score).toBe(100); expect(r.isCompliant).toBe(true);
  });
  it('all pass scenario 9', async () => {
    const rules = Array.from({ length: 5 }, (_, j) => makeRule('r' + j, 'R' + j, 'CUSTOM', '1', 'minor', () => true));
    const r = await runCompliance(rules, makeContext('t','e9', {}));
    expect(r.score).toBe(100); expect(r.isCompliant).toBe(true);
  });
  it('all pass scenario 10', async () => {
    const rules = Array.from({ length: 5 }, (_, j) => makeRule('r' + j, 'R' + j, 'CUSTOM', '1', 'minor', () => true));
    const r = await runCompliance(rules, makeContext('t','e10', {}));
    expect(r.score).toBe(100); expect(r.isCompliant).toBe(true);
  });
  it('all pass scenario 11', async () => {
    const rules = Array.from({ length: 5 }, (_, j) => makeRule('r' + j, 'R' + j, 'CUSTOM', '1', 'minor', () => true));
    const r = await runCompliance(rules, makeContext('t','e11', {}));
    expect(r.score).toBe(100); expect(r.isCompliant).toBe(true);
  });
  it('all pass scenario 12', async () => {
    const rules = Array.from({ length: 5 }, (_, j) => makeRule('r' + j, 'R' + j, 'CUSTOM', '1', 'minor', () => true));
    const r = await runCompliance(rules, makeContext('t','e12', {}));
    expect(r.score).toBe(100); expect(r.isCompliant).toBe(true);
  });
  it('all pass scenario 13', async () => {
    const rules = Array.from({ length: 5 }, (_, j) => makeRule('r' + j, 'R' + j, 'CUSTOM', '1', 'minor', () => true));
    const r = await runCompliance(rules, makeContext('t','e13', {}));
    expect(r.score).toBe(100); expect(r.isCompliant).toBe(true);
  });
  it('all pass scenario 14', async () => {
    const rules = Array.from({ length: 5 }, (_, j) => makeRule('r' + j, 'R' + j, 'CUSTOM', '1', 'minor', () => true));
    const r = await runCompliance(rules, makeContext('t','e14', {}));
    expect(r.score).toBe(100); expect(r.isCompliant).toBe(true);
  });
  it('all pass scenario 15', async () => {
    const rules = Array.from({ length: 5 }, (_, j) => makeRule('r' + j, 'R' + j, 'CUSTOM', '1', 'minor', () => true));
    const r = await runCompliance(rules, makeContext('t','e15', {}));
    expect(r.score).toBe(100); expect(r.isCompliant).toBe(true);
  });
  it('all pass scenario 16', async () => {
    const rules = Array.from({ length: 5 }, (_, j) => makeRule('r' + j, 'R' + j, 'CUSTOM', '1', 'minor', () => true));
    const r = await runCompliance(rules, makeContext('t','e16', {}));
    expect(r.score).toBe(100); expect(r.isCompliant).toBe(true);
  });
  it('all pass scenario 17', async () => {
    const rules = Array.from({ length: 5 }, (_, j) => makeRule('r' + j, 'R' + j, 'CUSTOM', '1', 'minor', () => true));
    const r = await runCompliance(rules, makeContext('t','e17', {}));
    expect(r.score).toBe(100); expect(r.isCompliant).toBe(true);
  });
  it('all pass scenario 18', async () => {
    const rules = Array.from({ length: 5 }, (_, j) => makeRule('r' + j, 'R' + j, 'CUSTOM', '1', 'minor', () => true));
    const r = await runCompliance(rules, makeContext('t','e18', {}));
    expect(r.score).toBe(100); expect(r.isCompliant).toBe(true);
  });
  it('all pass scenario 19', async () => {
    const rules = Array.from({ length: 5 }, (_, j) => makeRule('r' + j, 'R' + j, 'CUSTOM', '1', 'minor', () => true));
    const r = await runCompliance(rules, makeContext('t','e19', {}));
    expect(r.score).toBe(100); expect(r.isCompliant).toBe(true);
  });
  it('all fail scenario 0', async () => {
    const rules = Array.from({ length: 5 }, (_, j) => makeRule('r' + j, 'R' + j, 'CUSTOM', '1', 'critical', () => false, true));
    const r = await runCompliance(rules, makeContext('t','e0', {}));
    expect(r.score).toBe(0); expect(r.isCompliant).toBe(false);
  });
  it('all fail scenario 1', async () => {
    const rules = Array.from({ length: 5 }, (_, j) => makeRule('r' + j, 'R' + j, 'CUSTOM', '1', 'critical', () => false, true));
    const r = await runCompliance(rules, makeContext('t','e1', {}));
    expect(r.score).toBe(0); expect(r.isCompliant).toBe(false);
  });
  it('all fail scenario 2', async () => {
    const rules = Array.from({ length: 5 }, (_, j) => makeRule('r' + j, 'R' + j, 'CUSTOM', '1', 'critical', () => false, true));
    const r = await runCompliance(rules, makeContext('t','e2', {}));
    expect(r.score).toBe(0); expect(r.isCompliant).toBe(false);
  });
  it('all fail scenario 3', async () => {
    const rules = Array.from({ length: 5 }, (_, j) => makeRule('r' + j, 'R' + j, 'CUSTOM', '1', 'critical', () => false, true));
    const r = await runCompliance(rules, makeContext('t','e3', {}));
    expect(r.score).toBe(0); expect(r.isCompliant).toBe(false);
  });
  it('all fail scenario 4', async () => {
    const rules = Array.from({ length: 5 }, (_, j) => makeRule('r' + j, 'R' + j, 'CUSTOM', '1', 'critical', () => false, true));
    const r = await runCompliance(rules, makeContext('t','e4', {}));
    expect(r.score).toBe(0); expect(r.isCompliant).toBe(false);
  });
  it('all fail scenario 5', async () => {
    const rules = Array.from({ length: 5 }, (_, j) => makeRule('r' + j, 'R' + j, 'CUSTOM', '1', 'critical', () => false, true));
    const r = await runCompliance(rules, makeContext('t','e5', {}));
    expect(r.score).toBe(0); expect(r.isCompliant).toBe(false);
  });
  it('all fail scenario 6', async () => {
    const rules = Array.from({ length: 5 }, (_, j) => makeRule('r' + j, 'R' + j, 'CUSTOM', '1', 'critical', () => false, true));
    const r = await runCompliance(rules, makeContext('t','e6', {}));
    expect(r.score).toBe(0); expect(r.isCompliant).toBe(false);
  });
  it('all fail scenario 7', async () => {
    const rules = Array.from({ length: 5 }, (_, j) => makeRule('r' + j, 'R' + j, 'CUSTOM', '1', 'critical', () => false, true));
    const r = await runCompliance(rules, makeContext('t','e7', {}));
    expect(r.score).toBe(0); expect(r.isCompliant).toBe(false);
  });
  it('all fail scenario 8', async () => {
    const rules = Array.from({ length: 5 }, (_, j) => makeRule('r' + j, 'R' + j, 'CUSTOM', '1', 'critical', () => false, true));
    const r = await runCompliance(rules, makeContext('t','e8', {}));
    expect(r.score).toBe(0); expect(r.isCompliant).toBe(false);
  });
  it('all fail scenario 9', async () => {
    const rules = Array.from({ length: 5 }, (_, j) => makeRule('r' + j, 'R' + j, 'CUSTOM', '1', 'critical', () => false, true));
    const r = await runCompliance(rules, makeContext('t','e9', {}));
    expect(r.score).toBe(0); expect(r.isCompliant).toBe(false);
  });
  it('all fail scenario 10', async () => {
    const rules = Array.from({ length: 5 }, (_, j) => makeRule('r' + j, 'R' + j, 'CUSTOM', '1', 'critical', () => false, true));
    const r = await runCompliance(rules, makeContext('t','e10', {}));
    expect(r.score).toBe(0); expect(r.isCompliant).toBe(false);
  });
  it('all fail scenario 11', async () => {
    const rules = Array.from({ length: 5 }, (_, j) => makeRule('r' + j, 'R' + j, 'CUSTOM', '1', 'critical', () => false, true));
    const r = await runCompliance(rules, makeContext('t','e11', {}));
    expect(r.score).toBe(0); expect(r.isCompliant).toBe(false);
  });
  it('all fail scenario 12', async () => {
    const rules = Array.from({ length: 5 }, (_, j) => makeRule('r' + j, 'R' + j, 'CUSTOM', '1', 'critical', () => false, true));
    const r = await runCompliance(rules, makeContext('t','e12', {}));
    expect(r.score).toBe(0); expect(r.isCompliant).toBe(false);
  });
  it('all fail scenario 13', async () => {
    const rules = Array.from({ length: 5 }, (_, j) => makeRule('r' + j, 'R' + j, 'CUSTOM', '1', 'critical', () => false, true));
    const r = await runCompliance(rules, makeContext('t','e13', {}));
    expect(r.score).toBe(0); expect(r.isCompliant).toBe(false);
  });
  it('all fail scenario 14', async () => {
    const rules = Array.from({ length: 5 }, (_, j) => makeRule('r' + j, 'R' + j, 'CUSTOM', '1', 'critical', () => false, true));
    const r = await runCompliance(rules, makeContext('t','e14', {}));
    expect(r.score).toBe(0); expect(r.isCompliant).toBe(false);
  });
  it('all fail scenario 15', async () => {
    const rules = Array.from({ length: 5 }, (_, j) => makeRule('r' + j, 'R' + j, 'CUSTOM', '1', 'critical', () => false, true));
    const r = await runCompliance(rules, makeContext('t','e15', {}));
    expect(r.score).toBe(0); expect(r.isCompliant).toBe(false);
  });
  it('all fail scenario 16', async () => {
    const rules = Array.from({ length: 5 }, (_, j) => makeRule('r' + j, 'R' + j, 'CUSTOM', '1', 'critical', () => false, true));
    const r = await runCompliance(rules, makeContext('t','e16', {}));
    expect(r.score).toBe(0); expect(r.isCompliant).toBe(false);
  });
  it('all fail scenario 17', async () => {
    const rules = Array.from({ length: 5 }, (_, j) => makeRule('r' + j, 'R' + j, 'CUSTOM', '1', 'critical', () => false, true));
    const r = await runCompliance(rules, makeContext('t','e17', {}));
    expect(r.score).toBe(0); expect(r.isCompliant).toBe(false);
  });
  it('all fail scenario 18', async () => {
    const rules = Array.from({ length: 5 }, (_, j) => makeRule('r' + j, 'R' + j, 'CUSTOM', '1', 'critical', () => false, true));
    const r = await runCompliance(rules, makeContext('t','e18', {}));
    expect(r.score).toBe(0); expect(r.isCompliant).toBe(false);
  });
  it('all fail scenario 19', async () => {
    const rules = Array.from({ length: 5 }, (_, j) => makeRule('r' + j, 'R' + j, 'CUSTOM', '1', 'critical', () => false, true));
    const r = await runCompliance(rules, makeContext('t','e19', {}));
    expect(r.score).toBe(0); expect(r.isCompliant).toBe(false);
  });
});


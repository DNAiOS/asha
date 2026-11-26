"""Medication check with FHIR DetectedIssue output.

Deterministic screen over the DNAi rule table: no LLM, same input gives the
same output and `rule_table_version`. `format="fhir"` adds a FHIR R4 Bundle of
DetectedIssue resources you can store next to the MedicationStatement. An empty
result means no findings in the rules checked; `unchecked` names what the table
could not check. Free on every plan.

Run: ASHA_API_KEY=... python cookbook/06_med_check_fhir.py > detected_issues.json
"""

import json
import sys

from askasha import Asha
from askasha.types import Medication

MEDS = [
    Medication(name="warfarin", dose="5 mg", route="oral", frequency="daily"),
    Medication(name="fluconazole", dose="150 mg", route="oral"),
    Medication(name="lisinopril", dose="20 mg", frequency="daily"),
    Medication(name="spironolactone", dose="25 mg", frequency="daily"),
]


def main() -> int:
    client = Asha()
    mc = client.clinical.med_check(MEDS, age=74, egfr=38, potassium=5.1, audience="clinician", format="fhir")

    log = sys.stderr
    print(mc.findings_text, file=log)
    for f in mc.alerts:
        if f.kind == "insufficient_data":
            continue
        print(f"  [{f.severity}] {f.title}: {' + '.join(f.medications)}. {f.management} Source: {f.source}", file=log)
    for u in mc.unchecked:
        print(f"  not checked: {u.check or u.name}: {u.reason}", file=log)
    print(f"rule table {mc.rule_table_version}, {mc.drugs_checked} drugs, {mc.rules_checked} rules", file=log)

    issues = mc.detected_issues
    print(f"{len(issues)} FHIR DetectedIssue resources", file=log)
    json.dump(mc.fhir, sys.stdout, indent=2)
    print()
    return 0 if issues and all(i.get("resourceType") == "DetectedIssue" for i in issues) else 1


if __name__ == "__main__":
    raise SystemExit(main())

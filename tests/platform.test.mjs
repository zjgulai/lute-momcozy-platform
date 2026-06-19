/**
 * Platform smoke tests — verify data integrity at build time.
 *
 * Run: node --test tests/platform.test.mjs
 * (requires src/data/ to be populated — see README for setup)
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const DATA_ROOT = path.resolve(import.meta.dirname, "../src/data");
const dataExists = fs.existsSync(path.join(DATA_ROOT, "public-cross-audit.json"));

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(DATA_ROOT, rel), "utf8"));
}

function readDir(rel) {
  try {
    return fs.readdirSync(path.join(DATA_ROOT, rel));
  } catch {
    return [];
  }
}

describe("data availability", { skip: !dataExists ? "src/data/ not populated — run: cp -r ../lute-momcozy-audit/src/_data/. src/data/" : false }, () => {
  test("public-cross-audit.json loads and has required top-level keys", () => {
    const d = readJson("public-cross-audit.json");
    const required = ["generatedAt", "currentOperations", "external", "conclusions", "diagnosticNarrative", "metricDictionary", "diagnosticGaps360", "competitorEvidence"];
    for (const key of required) {
      assert.ok(key in d, `Missing top-level key: ${key}`);
    }
  });

  test("diagnosticNarrative has 8 problems with required fields", () => {
    const d = readJson("public-cross-audit.json");
    const problems = d.diagnosticNarrative?.problems ?? [];
    assert.equal(problems.length, 8, `Expected 8 problems, got ${problems.length}`);
    const ids = problems.map(p => p.id);
    for (const id of ["P1","P2","P3","P4","P5","P6","P7","P8"]) {
      assert.ok(ids.includes(id), `Missing problem ${id}`);
    }
    for (const p of problems) {
      assert.ok(p.title, `Problem ${p.id} missing title`);
      assert.ok(Array.isArray(p.evidence) && p.evidence.length > 0, `Problem ${p.id} missing evidence`);
      assert.ok(Array.isArray(p.immediateActions) && p.immediateActions.length > 0, `Problem ${p.id} missing immediateActions`);
      assert.ok(p.scqa?.s && p.scqa?.c && p.scqa?.q && p.scqa?.a, `Problem ${p.id} missing SCQA`);
    }
  });

  test("metricDictionary has 5 categories and 30 metrics", () => {
    const d = readJson("public-cross-audit.json");
    const dict = d.metricDictionary;
    assert.ok(dict, "metricDictionary missing");
    assert.equal(dict.categories?.length, 5, `Expected 5 categories, got ${dict.categories?.length}`);
    const total = dict.categories.reduce((s, c) => s + c.metrics.length, 0);
    assert.equal(total, 30, `Expected 30 metrics, got ${total}`);
    for (const cat of dict.categories) {
      for (const m of cat.metrics) {
        assert.ok(m.id, `Metric missing id in ${cat.id}`);
        assert.ok(m.zhName, `Metric ${m.id} missing zhName`);
        assert.ok(m.definition, `Metric ${m.id} missing definition`);
        assert.ok(m.formula, `Metric ${m.id} missing formula`);
      }
    }
  });

  test("sessions directory has at least one session file", () => {
    const files = readDir("sessions").filter(f => f.endsWith(".json"));
    assert.ok(files.length > 0, "No session files found");
  });

  test("latest session has required fields and valid confidence", () => {
    const files = readDir("sessions").filter(f => f.endsWith(".json")).sort();
    const latest = readJson(`sessions/${files[files.length - 1]}`);
    assert.ok(latest.sessionId, "Session missing sessionId");
    assert.ok(latest.observedAt, "Session missing observedAt");
    assert.ok(["high","medium","low"].includes(latest.confidence), `Invalid confidence: ${latest.confidence}`);
    assert.ok(latest.metrics, "Session missing metrics");
    assert.ok(typeof latest.metrics.fcp === "number" || latest.metrics.fcp === null, "FCP should be number or null");
    assert.ok(typeof latest.metrics.ttfb === "number" || latest.metrics.ttfb === null, "TTFB should be number or null");
  });

  test("competitors directory has at least one snapshot", () => {
    const files = readDir("competitors").filter(f => f.endsWith(".json"));
    assert.ok(files.length > 0, "No competitor snapshot files found");
  });

  test("latest competitor snapshot has 10 competitors", () => {
    const files = readDir("competitors").filter(f => f.endsWith(".json")).sort();
    const latest = readJson(`competitors/${files[files.length - 1]}`);
    assert.ok(Array.isArray(latest.competitors), "competitors should be array");
    assert.equal(latest.competitors.length, 10, `Expected 10 competitors, got ${latest.competitors.length}`);
  });

  test("360 framework has G1-G11 gaps registered", () => {
    const d = readJson("public-cross-audit.json");
    const gaps = d.diagnosticGaps360?.gaps ?? {};
    const required = ["G1_behavior","G2_funnel_segmented","G3_ltv_cohort","G4_email_sms","G5_inventory","G6_review_ecosystem","G7_checkout_business","G8_social_commerce","G9_pdp_content_depth","G10_support_quality","G11_seo_architecture"];
    for (const key of required) {
      assert.ok(key in gaps, `Missing gap: ${key}`);
      assert.ok(["not_started","partial","collected"].includes(gaps[key].status), `Invalid status for ${key}: ${gaps[key].status}`);
    }
  });

  test("SCQA lossRanking has correct structure", () => {
    const d = readJson("public-cross-audit.json");
    const ranking = d.diagnosticNarrative?.lossRanking ?? [];
    assert.equal(ranking.length, 8, `Expected 8 ranking items, got ${ranking.length}`);
    for (const item of ranking) {
      assert.ok(item.id, "Ranking item missing id");
      assert.ok(item.title, "Ranking item missing title");
    }
  });

  test("CVR and AOV are non-zero positive numbers", () => {
    const d = readJson("public-cross-audit.json");
    const cvr = d.currentOperations?.conversion?.conversionRate;
    const aov = d.currentOperations?.sales?.averageOrderValue;
    assert.ok(typeof cvr === "number" && cvr > 0 && cvr < 1, `CVR should be 0-1, got ${cvr}`);
    assert.ok(typeof aov === "number" && aov > 0, `AOV should be positive, got ${aov}`);
  });
});

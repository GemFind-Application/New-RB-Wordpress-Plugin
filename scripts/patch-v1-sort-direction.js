/**
 * Fix v1 diamond list sort direction: API was sent stale OrderType and column
 * header UI could disagree with the request. Also fix inverted ASC/DESC button styling.
 */
const fs = require("fs");
const path = require("path");

const jsFile = path.join(__dirname, "../public/static/js/frontend-v1.js");

if (!fs.existsSync(jsFile)) {
  console.error("Missing v1 bundle:", jsFile);
  process.exit(1);
}

let js = fs.readFileSync(jsFile, "utf8");
let count = 0;

function replaceAll(from, to, label) {
  if (!js.includes(from)) {
    return;
  }
  const hits = js.split(from).length - 1;
  js = js.split(from).join(to);
  count += hits;
  console.log(`v1 sort: ${label} (${hits})`);
}

// Stale React state: orderType(O) used pre-toggle value.
replaceAll(
  ',I("ASC"===O?"DESC":"ASC"),e.orderType(O)',
  ';const n="ASC"===O?"DESC":"ASC";I(n),e.orderType(n)',
  "ASC toggle uses computed n"
);
replaceAll(
  ',I("DESC"===O?"ASC":"DESC"),e.orderType(O)',
  ';const n="DESC"===O?"ASC":"DESC";I(n),e.orderType(n)',
  "DESC toggle uses computed n"
);

// Pass header UI direction into filter callbacks (avoid double-toggle mismatch).
const headerFilters = [
  ['onClick:t=>{$("ASC"===q?"DESC":"ASC"),e.filtershape(t)}', 'onClick:t=>{const n="ASC"===q?"DESC":"ASC";$(n),e.filtershape(t,n)}'],
  ['onClick:t=>{t.preventDefault(),ee("ASC"===Z?"DESC":"ASC"),e.filterCarat(t)}', 'onClick:t=>{t.preventDefault();const n="ASC"===Z?"DESC":"ASC";ee(n),e.filterCarat(t,n)}'],
  ['onClick:t=>{t.preventDefault(),ne("ASC"===te?"DESC":"ASC"),e.filterColor(t)}', 'onClick:t=>{t.preventDefault();const n="ASC"===te?"DESC":"ASC";ne(n),e.filterColor(t,n)}'],
  ['onClick:t=>{t.preventDefault(),ae("ASC"===re?"DESC":"ASC"),e.filterIntensity(t)}', 'onClick:t=>{t.preventDefault();const n="ASC"===re?"DESC":"ASC";ae(n),e.filterIntensity(t,n)}'],
  ['onClick:t=>{t.preventDefault(),oe("ASC"===ie?"DESC":"ASC"),e.filterClarity(t)}', 'onClick:t=>{t.preventDefault();const n="ASC"===ie?"DESC":"ASC";oe(n),e.filterClarity(t,n)}'],
  ['onClick:t=>{t.preventDefault(),le("ASC"===se?"DESC":"ASC"),e.filterCut(t)}', 'onClick:t=>{t.preventDefault();const n="ASC"===se?"DESC":"ASC";le(n),e.filterCut(t,n)}'],
  ['onClick:t=>{t.preventDefault(),de("ASC"===ce?"DESC":"ASC"),e.filterDepth(t)}', 'onClick:t=>{t.preventDefault();const n="ASC"===ce?"DESC":"ASC";de(n),e.filterDepth(t,n)}'],
  ['onClick:t=>{t.preventDefault(),pe("ASC"===ue?"DESC":"ASC"),e.filterTable(t)}', 'onClick:t=>{t.preventDefault();const n="ASC"===ue?"DESC":"ASC";pe(n),e.filterTable(t,n)}'],
  ['onClick:t=>{t.preventDefault(),we("ASC"===xe?"DESC":"ASC"),e.filterCertificate(t)}', 'onClick:t=>{t.preventDefault();const n="ASC"===xe?"DESC":"ASC";we(n),e.filterCertificate(t,n)}'],
  ['onClick:t=>{t.preventDefault(),J("ASC"===Q?"DESC":"ASC"),e.filterPrice(t)}', 'onClick:t=>{t.preventDefault();const n="ASC"===Q?"DESC":"ASC";J(n),e.filterPrice(t,n)}'],
];

for (const [from, to] of headerFilters) {
  replaceAll(from, to, "header passes direction");
}

const filterHandlers = [
  ['filterPrice:t=>{e.orderbytype("FltPrice");const n="ASC"===O?"DESC":"ASC";I(n),e.orderType(n)}', 'filterPrice:(t,n)=>{e.orderbytype("FltPrice"),I(n),e.orderType(n)}'],
  ['filtershape:t=>{e.orderbytype("Cut");const n="ASC"===O?"DESC":"ASC";I(n),e.orderType(n)}', 'filtershape:(t,n)=>{e.orderbytype("Cut"),I(n),e.orderType(n)}'],
  ['filterCarat:t=>{e.orderbytype("Size");const n="ASC"===O?"DESC":"ASC";I(n),e.orderType(n)}', 'filterCarat:(t,n)=>{e.orderbytype("Size"),I(n),e.orderType(n)}'],
  ['filterColor:t=>{e.orderbytype("Color");const n="DESC"===O?"ASC":"DESC";I(n),e.orderType(n)}', 'filterColor:(t,n)=>{e.orderbytype("Color"),I(n),e.orderType(n)}'],
  ['filterIntensity:t=>{e.orderbytype("FancyColorIntensity");const n="DESC"===O?"ASC":"DESC";I(n),e.orderType(n)}', 'filterIntensity:(t,n)=>{e.orderbytype("FancyColorIntensity"),I(n),e.orderType(n)}'],
  ['filterClarity:t=>{e.orderbytype("ClarityID");const n="ASC"===O?"DESC":"ASC";I(n),e.orderType(n)}', 'filterClarity:(t,n)=>{e.orderbytype("ClarityID"),I(n),e.orderType(n)}'],
  ['filterCut:t=>{e.orderbytype("CutGrade");const n="ASC"===O?"DESC":"ASC";I(n),e.orderType(n)}', 'filterCut:(t,n)=>{e.orderbytype("CutGrade"),I(n),e.orderType(n)}'],
  ['filterCertificate:t=>{e.orderbytype("Certificate");const n="ASC"===O?"DESC":"ASC";I(n),e.orderType(n)}', 'filterCertificate:(t,n)=>{e.orderbytype("Certificate"),I(n),e.orderType(n)}'],
  ['filterMeasurement:t=>{e.orderbytype("Measurements");const n="ASC"===O?"DESC":"ASC";I(n),e.orderType(n)}', 'filterMeasurement:(t,n)=>{e.orderbytype("Measurements"),I(n),e.orderType(n)}'],
  ['filterPolish:t=>{e.orderbytype("Polish");const n="ASC"===O?"DESC":"ASC";I(n),e.orderType(n)}', 'filterPolish:(t,n)=>{e.orderbytype("Polish"),I(n),e.orderType(n)}'],
  ['filterTable:t=>{e.orderbytype("TableMeasure");const n="ASC"===O?"DESC":"ASC";I(n),e.orderType(n)}', 'filterTable:(t,n)=>{e.orderbytype("TableMeasure"),I(n),e.orderType(n)}'],
  ['filterDepth:t=>{e.orderbytype("Depth");const n="ASC"===O?"DESC":"ASC";I(n),e.orderType(n)}', 'filterDepth:(t,n)=>{e.orderbytype("Depth"),I(n),e.orderType(n)}'],
  ['filterSummery:t=>{e.orderbytype("Symmetry");const n="ASC"===O?"DESC":"ASC";I(n),e.orderType(n)}', 'filterSummery:(t,n)=>{e.orderbytype("Symmetry"),I(n),e.orderType(n)}'],
];

for (const [from, to] of filterHandlers) {
  replaceAll(from, to, "filter uses passed direction");
}

// ASC/DESC toolbar: active class was on the wrong button.
replaceAll(
  '"asc"===t.target.id?(A("inactive"),T("active"),n="ASC",I(n)):(A("active"),T("inactive"),n="DESC",I(n))',
  '"asc"===t.target.id?(A("active"),T("inactive"),n="ASC",I(n)):(A("inactive"),T("active"),n="DESC",I(n))',
  "ASC/DESC button active class"
);

// Default sort: UI showed ASC/Shape but API sent empty OrderBy/OrderType until icon click.
replaceAll(
  '[Qe,Je]=(0,t.useState)(""),[Ze,et]=(0,t.useState)("")',
  '[Qe,Je]=(0,t.useState)("Cut"),[Ze,et]=(0,t.useState)("ASC")',
  "default OrderBy Cut + OrderType ASC"
);

replaceAll('defaultValue:"Shape"', 'defaultValue:"Cut"', "dropdown default matches Shape option value");

// Changing sort field must send the current toolbar direction to the API.
replaceAll(
  "onChange:t=>{e.orderbytype(t.target.value)}",
  "onChange:t=>{e.orderbytype(t.target.value),e.orderType(O)}",
  "dropdown change applies current direction"
);

// Always refetch when ASC/DESC is clicked (even if direction unchanged).
replaceAll(
  "jn=e=>{Ze!==e&&(et(e),Xe(!0))}",
  "jn=e=>{et(e),Xe(!0)}",
  "orderType always refetches"
);

if (
  js.includes(',I("ASC"===O?"DESC":"ASC"),e.orderType(O)') ||
  js.includes(',I("DESC"===O?"ASC":"DESC"),e.orderType(O)')
) {
  console.warn("v1 bundle still contains stale e.orderType(O) toggle — review patch rules");
  process.exitCode = 1;
}

fs.writeFileSync(jsFile, js, "utf8");
console.log(`Patched v1 sort direction: ${count} replacements`);

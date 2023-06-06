const dig = require("node-dig-dns");
const data = require("./domain.json");
const fs = require("fs");

(async () => {
  for (let i in data) {
    const domain = data[i].domain;
    console.log(domain);
    let ns = null;
    for (let a = 0; a < 3; a++) {
      try {
        ns = await dig([domain, "NS"]);
        if (Array.isArray(ns.answer)) break;
      } catch (e) {}
    }

    const ns_list = Array.isArray(ns.answer) ? ns.answer : [];
    const ns_data = [];
    for (let a of ns_list) {
      let limit = 3;
      let total_time = 0;
      let success = 0;
      let error = 0;

      console.log(a.value);
      while (success < limit && error < limit) {
        try {
          const t = await dig(["@" + a.value, domain, "A"]);
          if (t.time > 0) {
            total_time += t.time;
            success += 1;
          } else {
            error += 1;
          }
        } catch (e) {
          error += 1;
        }
      }
      ns_data.push({
        domain: a.value,
        status: error == limit ? false : true,
        time: Math.round(total_time / limit),
      });
    }
    data[i].ns = ns_data;
  }

  const result = { updated_at: new Date(), data: data };
  fs.writeFileSync("dist/ns.json", JSON.stringify(result, null, 2));
  console.log(JSON.stringify(data));
})();

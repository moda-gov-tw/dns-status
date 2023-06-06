const dig = require("node-dig-dns");
const data = require("./domain.json");
const fs = require("fs");

(async () => {
  for (let i in data) {
    const domain = data[i].domain;
    console.log(domain);
    const ns = await dig([domain, "NS"]);
    const ns_data = [];
    for (let a of ns.answer) {
      let limit = 3;
      let total_time = 0;
      let success = 0;
      let error = 0;

      console.log(a.value);
      while (success < limit && error < limit) {
        try {
          const t = await dig(["@" + a.value, domain, "A"]);
          total_time += t.time;
          success += 1;
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
    data[i].ns = ns_data.sort();
  }

  const result = { updated_at: new Date(), data: data };
  fs.writeFileSync("dist/ns.json", JSON.stringify(result, null, 2));
  console.log(JSON.stringify(data));
})();

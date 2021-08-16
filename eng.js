const request = require("request");
const { parse } = require("node-html-parser");

_ = document.querySelector.bind(document);

const load = _(".load");
const btn_submit = _(".btn_submit");
const result_dk = _(".result-dk");
const btn_stop = _(".btn_stop");
const result_session = _(".result");
const cookie = _("#cookie_ID");
const mhp = _("#mhp_ID");
const thp = _("#thp_ID");
const endPoint = "https://dkmh.hcmute.edu.vn/";
let data_cookie = "";
let data_mhp = [];
let data_thp = [];
let send = 0;
received = 0;
let success = [];
function render(data) {
  result_session.innerHTML = data;
}
let log = [];
let inter;
let running = false;
let openLog = true;
const setRunning = (s) => {
  running = s;
  if (s) {
    load.style.display = "block";
    btn_submit.disabled = true;
    btn_stop.disabled = false;
  } else {
    load.style.display = "none";
    btn_submit.disabled = false;
    btn_stop.disabled = true;
  }
};

_(".toggle").addEventListener("click", (e) => {
  e.preventDefault();
  openLog = !openLog;
  if (openLog) {
    _(".log").style.display = "block";
  } else {
    _(".log").style.display = "none";
  }
});
let ci = 0;
const pushLog = (d) => {
  ci++;
  log.push(d);
  if (openLog) {
    let res = "";
    log.forEach((d) => {
      res += "<p><b>" + d.code + "</b>: " + d.log + "</p>";
    });
    _(".log").innerHTML = res;
  }
  if (ci % 500 == 0) {
    _(".log").innerHTML = "";
  }
  // res += "<p><b>" + d.code + "</b>: " + d.log + "</p>";
  // _(".log").innerHTML = res;
};
btn_submit.addEventListener("click", (e) => {
  e.preventDefault();
  if (!cookie.value || !mhp.value) {
    alert("Vui lòng nhập đầy đủ");
    return;
  }

  data_cookie = cookie.value;
  data_mhp = mhp.value.split("|");
  data_mhp = data_mhp.filter((item, index) => data_mhp.indexOf(item) === index);

  data_thp = thp.value.split("|");
  data_thp = data_thp.filter((item, index) => data_thp.indexOf(item) === index);
  setRunning(true);
  //   request(
  //     {
  //       uri: endPoint,
  //       method: "GET",
  //       headers: {
  //         cookie: data_cookie,
  //       },
  //     },
  //     (e, r, b) => {
  //       if (e) {
  //         setRunning(false);
  //         alert("Xảy ra lỗi");
  //         return;
  //       }
  //       htmlTag = parse(b);
  //       if (
  //         htmlTag.querySelector("input").rawAttributes.value ==
  //         "Đăng nhập qua email"
  //       ) {
  //         let tag = `<div class="col-12"><div class="alert alert-danger" role="alert">
  //         Cookie không đúng
  //       </div></div>`;
  //         setRunning(false);
  //         render(tag);
  //         return;
  //       }

  //       goToGame(htmlTag);
  //     }
  //   );
  goToGame();
});

function goToGame() {
  render("");

  let setName = false;

  if (data_mhp.length > 0) {
    inter = setInterval(() => {
      setRunning(true);
      let rs = "<div class='col-12'>";
      rs += "<p class='xllo'>Tổng request gửi: " + send + "</p>";
      rs += "<p class='xllo'>Tổng response nhận: " + received + "</p>";
      rs += "<p class='dklo'>Những môn đang đăng ký:\n" + "</p>";
      rs += render_regis();
      rs += "<p class='dklo'>Những môn đăng ký thành công:\n" + "</p>";
      rs += render_result();
      rs += "</div>";
      result_dk.innerHTML = rs;
      if (data_mhp.length == 0) {
        clearInterval(inter);
        setRunning(false);
      }
      for (let i = 0; i < data_mhp.length; i++) {
        let formData = {
          StudyUnitID: "211" + data_mhp[i].split("_")[0],
          CurriculumID: data_mhp[i].split("_")[0],
          hdID:
            "211" +
            data_mhp[i] +
            "$3.00$211" +
            data_mhp[i].split("_")[0] +
            "$1$0|",
          [data_thp[i]]: "on",
        };
        // console.log(formData);
        send++;
        request(
          {
            method: "POST",
            uri: "https://dkmh.hcmute.edu.vn/DangKiNgoaiKeHoach/DanhSachLopHocPhanPost",
            formData: formData,
            headers: {
              cookie: data_cookie,
            },
          },
          (e, r, b) => {
            let result_dk = parse(b);
            if (!setName) {
              if (result_dk.querySelector("title")?.text.includes("Object")) {
                let tag = `<div class="col-12"><div class="alert alert-danger" role="alert">
                Cookie không đúng
              </div></div>`;
                setRunning(false);
                clearInterval(inter);
                render(tag);
                return;
              }
              let result = "";
              request(
                {
                  uri: endPoint,
                  method: "GET",
                  headers: {
                    cookie: data_cookie,
                  },
                },
                (e, r, b) => {
                  if (e) {
                    setRunning(false);
                    alert("Xảy ra lỗi");
                    return;
                  }
                  htmlTag = parse(b);
                  if (
                    htmlTag.querySelector("input")?.rawAttributes.value ==
                    "Đăng nhập qua email"
                  ) {
                    let tag = `<div class="col-12"><div class="alert alert-danger" role="alert">
                      Cookie không đúng
                    </div></div>`;
                    setRunning(false);
                    render(tag);
                    return;
                  }
                  result +=
                    "<p class='text-center name'>" +
                    htmlTag.querySelector(".menu2 a")?.innerHTML +
                    "</p>";
                  result +=
                    "<p class='text-center sll'>Số môn đăng ký: " +
                    data_mhp.length +
                    "</p>";
                  if (
                    htmlTag
                      .querySelector(".panelcontent1 script")
                      ?.text.includes("nằm trong thời hạn đăng")
                  ) {
                    result +=
                      "<p class='text-center'>Không nằm trong thời hạn đăng ký</p>";
                  }

                  result = `<div class="col-12">` + result + "</div>";
                  render(result);
                }
              );

              setName = true;
            }
            let result = result_dk.querySelector("td p")?.text;
            let nameM = data_mhp[i];
            pushLog({ code: nameM, log: result });
            if (result?.includes("Đăng ký thành công")) {
              success.push(nameM);
              data_mhp = data_mhp.filter((d) => d != nameM);
            }
            received++;
          }
        );
      }
    }, 1000);
  }
}
function render_regis() {
  let result = "";
  data_mhp.forEach((r) => {
    result += "<p class='sul'>" + r + "</p>";
  });
  return result;
}
function render_result() {
  let result = "";
  success.forEach((r) => {
    result += "<p class='sul'>" + r + "</p>";
  });
  return result;
}
btn_stop.addEventListener("click", (e) => {
  e.preventDefault();
  clearInterval(inter);
  setRunning(false);
});

import Cookies from "js-cookie";
import { decryptId } from "./Encryptor";

const fetchData = async (url, param = {}) => {
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;

  try {
    let paramToSent = {
      ...param,
      activeUser: activeUser === "" ? undefined : activeUser,
    };

    // 🔹 khusus MasterBarang/GetDataBarang
    if (url.includes("MasterBarang/GetDataBarang")) {
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(paramToSent),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      // console.log("Special API:", url, result);

      if (response.ok) {
        // mapping khusus
        return result.map((item) => ({
          ...item,
          Status: item.Status === 1 ? "Aktif" : "Non Aktif",
          Alignment: [
            "center", "center", "left", "left", "left",
            "left", "left", "center", "center", "center", "center", "center",
          ],
        }));
      } else {
        return "ERROR";
      }
    }

    // 🔹 default API (semua selain MasterBarang/GetDataBarang)
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(paramToSent),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const result = await response.json();
    // console.log("Default API:", url, result);
    return response.ok ? result : "ERROR";

  } catch (err) {
    // console.error("fetchData error:", err);
    return "ERROR";
  }
};

export default fetchData;

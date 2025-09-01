import React from "react";
import Cookies from "js-cookie";
import { decryptId } from "../../util/Encryptor";
import { useEffect, useRef, useState, useCallback } from "react";
import { PAGE_SIZE, API_LINK } from "../../util/Constants";
import UseFetch from "../../util/UseFetch";
import TableLandingPage from "../../part/TableLandingPage";
import Alert from "../../part/Alert";
import Loading from "../../part/Loading";
import moment from "moment"; // Pastikan Anda telah menginstal moment.js

const initialData = [
  {
    Key: null,
    No: null,
    "Nama Material": null,
    "Spesifikasi Material":null,
    "Jumlah Barang": null,
    "Nomor SPK": null,
    "Tanggal Diterima": null,
    Count: 0,
  },
];

export default function BerandaIndex() {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(initialData);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    column: "",
    query: "",
    sort: "[Tanggal Diterima] asc",
  });
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertCount, setAlertCount] = useState(0);
  const activeUser = Cookies.get("activeUser");
  let userRole = "";

  if (activeUser) {
    const decryptedUser = decryptId(activeUser); // decode base64
    const cleanDecryptedUser = decryptedUser.replace("decryptedUser", "");
    const decodedUser = JSON.parse(cleanDecryptedUser); // decode JSON
    userRole = decodedUser.peran;
  }

  const handleHeaderBoxSearchQuery = (e) => {
    const { name, value } = e.target;
    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      page: 1,
      column: name,
      query: value,
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);
      setIsLoading(true);
      try {
        const data = await UseFetch(
          API_LINK + "MasterMaterial/GetDataMaterialGudang",
          currentFilter
        );
        if (data === "ERROR") {
          setIsError(true);
        } else if (data.length === 0) {
          setCurrentData(initialData);
        } else {
          const currentDate = moment();
          const formattedData = data.map((value) => ({
            ...value,
            Alignment: ["left", "left", "left", "left", "left"],
          }));
          setCurrentData(formattedData);

          // Menghitung jumlah barang dengan waktu penyimpanan lebih dari 3 hari
          const count = data.filter((item) => {
            const receivedDate = moment(item["Tanggal Diterima"]);
            return currentDate.diff(receivedDate, "days") > 3;
          }).length;

          setAlertCount(count);
          setAlertVisible(count > 0);
        }
      } catch {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [currentFilter]);

  return (
    <>
      {userRole === "GUDANG" ? (
        <div className="mt-3">
          {isLoading ? (
            <Loading />
          ) : (
            <div className="d-flex flex-column">
              {alertVisible && (
                <>
                  <div className="flex-fill">
                    <Alert
                      type="warning"
                      message={`Perhatian: Terdapat ${alertCount} barang dengan waktu penyimpanan sudah melebihi 3 hari.`}
                    />
                  </div>
                  <div className="mt-3">
                    <div className="d-flex flex-column">
                      <TableLandingPage
                        data={currentData}
                        enableColumnSearchBox={true}
                        setHeaderBoxSearchQuery={handleHeaderBoxSearchQuery}
                      />
                    </div>
                  </div>
                </>
              )}
              {!alertVisible && (
                <div className="card">
                  <div className="card-header bg-primary text-white p-4">
                    <span className="lead fw-medium">
                      Selamat Datang di Sistem Manajemen Gudang
                    </span>
                  </div>
                  <div className="card-body lead p-4">
                    Sistem Manajemen Gudang ini akan membantu Anda dalam
                    mengelola gudang dengan lebih efisien.
                    <br />
                    Mari mulai dengan mengeksplorasi fitur-fitur yang ada dengan
                    mengakses menu yang tersedia.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="card">
          <div className="card-header bg-primary text-white p-4">
            <span className="lead fw-medium">
              Selamat Datang di Sistem Manajemen Gudang
            </span>
          </div>
          <div className="card-body lead p-4">
            Sistem Manajemen Gudang ini akan membantu Anda dalam mengelola
            gudang dengan lebih efisien.
            <br />
            Mari mulai dengan mengeksplorasi fitur-fitur yang ada dengan
            mengakses menu yang tersedia.
          </div>
        </div>
      )}
    </>
  );
}

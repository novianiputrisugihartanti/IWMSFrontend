import { useEffect, useRef, useState } from "react";
import { object, string, number } from "yup";
import { API_LINK, FILE_LINK } from "../../util/Constants";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import Label from "../../part/Label";
import Table from "../../part/Table";

const initialData = [
  {
    Key: null,
    No: null,
    "Nama Barang": null,
    Count: 0,
  },
];
export default function TransaksiPengambilanBarangDetail({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [tableData, setTableData] = useState(initialData);
  const [shift, setShift] = useState("");

  const formDataRef = useRef({
    PabNo: withID,
    pabNamaPengambil: "",
    pabNomorBpb: "",
    pabNomorSpk: "",
    pabNpkPengambil: "",
    pabTanggalPengambilan: ""
  });

  const userSchema = object({
    PabNo: string(),
    pabNamaPengambil: string(),
    pabNomorBpb: string(),
    pabNomorSpk: string(),
    pabNpkPengambil: string(),
    pabTanggalPengambilan: string(),
  });

  useEffect(() => {
    const fetchHeaderData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));
      try {
        const data = await UseFetch(API_LINK + "TransaksiPengambilanBarang/GetDataTranspengambilanById", { PabNo: withID });
        if (data === "ERROR" || data.length === 0) {
          throw new Error("Terjadi kesalahan: Gagal mengambil data pengambilan barang.");
        } else {
          const updateFormData = {
            PabNo: data[0].PabNo,
            pabNamaPengambil: data[0].pabNamaPengambil,
            pabNomorBpb: data[0].pabNomorBpb,
            pabNomorSpk: data[0].pabNomorSpk,
            pabNpkPengambil: data[0].pabNpkPengambil,
            pabTanggalPengambilan: data[0].pabTanggalPengambilan
          };
          formDataRef.current = { ...formDataRef.current, ...updateFormData };
        }
      } catch (error) {
        setIsError((prevError) => ({
          ...prevError,
          error: true,
          message: error.message,
        }));
      }
    };

    const fetchTableData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));
      try {
        const data = await UseFetch(API_LINK + "TransaksiPengambilanBarang/GetDataTranspengambilanDetailToShow", { PabNo: withID }, "POST");

        if (data === "ERROR") {
          setIsError(true);
        } else if (data.length === 0) {
          setTableData(initialData);
        } else {
          const formattedData = data.map((value) => ({
            ...{
              Key: value.Key,
              "Kode Batang": (
                <img
                  src={`${FILE_LINK}${value["Kode Batang"]}.jpg`}
                  alt=""
                  style={{ width: '200px', height: 'auto' }}
                />
              ),
              "Nama Barang": value["Nama Barang"],
              "Jumlah": value.Jumlah,
              Count: value.Count,
            },
            Alignment: ["center", "center", "center", "center"],
          }));
          setTableData(formattedData);
        }
      } catch (error) {
        setIsError((prevError) => ({
          ...prevError,
          error: true,
          message: error.message,
        }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeaderData();
    fetchTableData();
  }, [withID]);

  if (isLoading) return <Loading />;

  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}
      <div className="card">
        <div className="card-header bg-primary fw-medium text-white">
          Pengambilan Barang
        </div>
        <div className="card-body p-4">
          <div className="row">
            <div className="col-lg-4">
              <Label
                forLabel="pabNpkPengambil"
                title="NPK Pengambil"
                data={formDataRef.current.pabNpkPengambil}
              />
            </div>
            <div className="col-lg-4">
              <Label
                forLabel="pabNamaPengambil"
                title="Nama Pengambil"
                data={formDataRef.current.pabNamaPengambil}
              />
            </div>
            <div className="col-lg-4">
              <Label
                forLabel="pabNomorSpk"
                title="Nomor SPK"
                data={formDataRef.current.pabNomorSpk}
              />
            </div>
            <div className="col-lg-4">
              <Label
                forLabel="pabTanggalPengambilan"
                title="Tanggal Pengambilan"
                data={formDataRef.current.pabTanggalPengambilan}
              />
            </div>
            <div className="col-lg-4">
              <Label
                forLabel="pabNomorBpb"
                title="Nomor BPB"
                data={formDataRef.current.pabNomorBpb}
              />
            </div>
            
          </div>
          <div className="row mt-2">
            <div className="d-flex flex-column">
              <Table data={tableData} />
            </div>
          </div>
        </div>
      </div>
      <div className="float-end my-4 mx-1">
        <Button
          classType="secondary me-2 px-4 py-2"
          label="KEMBALI"
          onClick={() => onChangePage("index")}
        />
      </div>
    </>
  );
}
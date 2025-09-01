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
export default function TransaksiBuktiPengambilanBarangDetail({
  onChangePage,
  withID,
}) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [tableData, setTableData] = useState(initialData);
  const [shift, setShift] = useState("");

  const formDataRef = useRef({
    bpbId: withID,
    bpbTanggal: "",
  });

  const userSchema = object({
    bpbId: string(),
    bpbTanggal: string(),
  });

  useEffect(() => {
    const fetchHeaderData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));
      try {
        const data = await UseFetch(
          API_LINK +
            "TransaksiBuktiPengambilanBarang/GetDataTransBuktiPengambilanBarangById",
          { bpbId: withID }
        );
        if (data === "ERROR" || data.length === 0) {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil data bukti pengambilan barang."
          );
        } else {
          const updateFormData = {
            bpbId: data[0].bpbId,
            bpbTanggal: data[0].bpbTanggal,
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
        const data = await UseFetch(
          API_LINK +
            "TransaksiBuktiPengambilanBarang/GetDataTransBuktiPengambilanBarangDetailToShow",
          { bpbId: withID },
          "POST"
        );

        if (data === "ERROR") {
          setIsError(true);
        } else if (data.length === 0) {
          setTableData(initialData);
        } else {
          const formattedData = data.map((value) => ({
            ...value,
            Alignment: [
              "center",
              "center",
              "center",
              "center",
              "center",
              "center",
            ],
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
          Bukti Pengambilan Barang
        </div>
        <div className="card-body p-4">
          <div className="row">
            <div className="col-lg-4">
              <Label
                forLabel="bpbId"
                title="Nomor BPB"
                data={formDataRef.current.bpbId}
              />
            </div>
            <div className="col-lg-4">
              <Label
                forLabel="bpbTanggal"
                title="BPB Tanggal"
                data={formDataRef.current.bpbTanggal}
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

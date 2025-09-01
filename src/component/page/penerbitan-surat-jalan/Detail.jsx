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
export default function PenerbitanSuratJalanDetail({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [tableData, setTableData] = useState(initialData);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [shift, setShift] = useState("");

  const formDataRef = useRef({
    PabNo: withID,
    pabNoSuratJalan: "",
    customer: "",
    pabTanggalSuratJalan: "",
    pab_nomor_po: "",
    pab_order_sheet: "",
  });

  const userSchema = object({
    PabNo: string(),
    pabNoSuratJalan: string(),
    customer: string(),
    pabTanggalSuratJalan: string(),
    pab_nomor_po: string(),
    pab_order_sheet: string(),
  });

  useEffect(() => {
    const fetchHeaderData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));
      try {
        const data = await UseFetch(
          API_LINK +
            "TransaksiPenerbitanSuratJalan/GetDataTransPenerbitanSuratJalanById",
          { pabNoSuratJalan: withID }
        );
        if (data === "ERROR" || data.length === 0) {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil data penerbitan surat jalan."
          );
        } else {
          const updateFormData = {
            PabNo: data[0].PabNo,
            pabNoSuratJalan: data[0].pabNoSuratJalan,
            customer: data[0].customer,
            pabTanggalSuratJalan: data[0].pabTanggalSuratJalan,
            pab_nomor_po: data[0].pab_nomor_po,
            pab_order_sheet: data[0].pab_order_sheet,
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
            "TransaksiPenerbitanSuratJalan/GetDataTransPenerbitanSuratJalanDetailToShow",
          { pabNoSuratJalan: withID },
          "POST"
        );

        if (data === "ERROR") {
          setIsError(true);
        } else if (data.length === 0) {
          setTableData(initialData);
        } else {
          const formattedData = data.map((value) => ({
            ...{
              No: value.No,
              "Nama Barang": value["Nama Barang"],
              Jumlah: value.Jumlah,
              Satuan: value.Satuan,
              Keterangan: value.Keterangan,
              Barcode: value.Barcode?.split(",").map((element, index) => (
                <img
                  key={index}
                  src={`${FILE_LINK}${element}.jpg`}
                  alt={element}
                  width={250}
                  style={{ display: "block", margin: "10px auto" }}
                />
              )),
            },
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
          Pengambilan Barang
        </div>
        <div className="card-body p-4">
          <div className="row">
            <div className="col-lg-4">
              <Label
                forLabel="pabNoSuratJalan"
                title="Nomor Surat Jalan"
                data={formDataRef.current.pabNoSuratJalan}
              />
            </div>
            <div className="col-lg-4">
              <Label
                forLabel="pabTanggalSuratJalan"
                title="Tanggal Surat Jalan"
                data={formDataRef.current.pabTanggalSuratJalan}
              />
            </div>
            <div className="col-lg-4">
              <Label
                forLabel="customer"
                title="Customer"
                data={formDataRef.current.customer}
              />
            </div>
            <div className="col-lg-4">
              <Label
                forLabel="pab_nomor_po"
                title="Nomor PO"
                data={formDataRef.current.pab_nomor_po}
              />
            </div>
            <div className="col-lg-4">
              <Label
                forLabel="pab_order_sheet"
                title="Nomor OS"
                data={formDataRef.current.pab_order_sheet}
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

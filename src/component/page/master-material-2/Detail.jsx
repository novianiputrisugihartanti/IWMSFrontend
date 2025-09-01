import { useEffect, useState } from "react";
import { API_LINK, FILE_LINK } from "../../util/Constants";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import DropDown from "../../part/Dropdown";
import Input from "../../part/Input";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import LabelImages from "../../part/LabelImages";

export default function MasterMaterialDetail({ onChangePage, withID }) {
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [listKategori, setListKategori] = useState([]);
  const [listSubKategori, setListSubKategori] = useState([]);
  const [listSatuan, setListSatuan] = useState([]);
  
  const [formData, setFormData] = useState({
    barId: withID,
    barNama: "",
    barKategori: "",
    barSubKategori: "",
    barSatuan: "",
    barFoto: ""
  });

  const fetchDataByEndpointAndParams = async (
    endpoint,
    params,
    setter,
    errorMessage
  ) => {
    setIsError((prevError) => ({ ...prevError, error: false }));
    try {
      const data = await UseFetch(endpoint, params);
      if (data === "ERROR") {
        throw new Error(errorMessage);
      } else {
        setter(data);
      }
    } catch (error) {
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: error.message,
      }));
      setter([]);
    }
  };

  // Ambil data referensi
  useEffect(() => {
    fetchDataByEndpointAndParams(
      API_LINK + "Utilities/GetListKategori",
      {},
      setListKategori,
      "Gagal mengambil daftar kategori"
    );

    fetchDataByEndpointAndParams(
      API_LINK + "Utilities/GetListSatuan",
      {},
      setListSatuan,
      "Gagal mengambil daftar satuan"
    );
  }, []);

  // Ambil subkategori saat kategori utama dipilih
  useEffect(() => {
    if (formData.barKategori) {
      fetchDataByEndpointAndParams(
        API_LINK + "Utilities/GetListSubKategoriByKategori",
        { kategori: formData.barKategori },
        setListSubKategori,
        "Gagal mengambil daftar subkategori"
      );
    } else {
      setListSubKategori([]);
    }
  }, [formData.barKategori]);

  // Ambil data material berdasarkan ID
  useEffect(() => {
    const fetchData = async () => {
      setIsError({ error: false, message: "" });
      try {
        const data = await UseFetch(
          API_LINK + "MasterBarang/GetDataBarangById",
          { barId: withID }
        );
        
        if (data === "ERROR" || data.length === 0) {
          throw new Error("Gagal mengambil data material");
        } else {
          setFormData({
            barId: data[0].barId,
            barNama: data[0].barNama,
            barKategori: data[0].barKategori,
            barSubKategori: data[0].barSubKategori,
            barSatuan: data[0].barSatuan,
            barFoto: data[0].barFoto
          });
        }
      } catch (error) {
        setIsError({
          error: true,
          message: error.message || "Terjadi kesalahan",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [withID]);

  const handleEdit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const data = await UseFetch(
        API_LINK + "MasterMaterial/EditMaterial",
        formData
      );

      if (data === "ERROR") {
        throw new Error("Gagal menyimpan data material");
      }
      
      SweetAlert("Sukses", "Data material berhasil diedit", "success");
      onChangePage("index");
    } catch (error) {
      setIsError({
        error: true,
        message: error.message || "Terjadi kesalahan saat menyimpan",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (isLoading) return <Loading />;

  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}
      <form onSubmit={handleEdit}>
        <div className="card">
          <div className="card-header bg-primary fw-medium text-white">
            Detail Data Material
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-6">
                <Input
                  type="text"
                  forInput="barNama"
                  label="Nama Material"
                  value={formData.barNama}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-lg-6">
                <DropDown
                  forInput="barKategori"
                  label="Kategori"
                  arrData={listKategori}
                  value={formData.barKategori}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-lg-6">
                <DropDown
                  forInput="barSubKategori"
                  label="Sub Kategori"
                  arrData={listSubKategori}
                  value={formData.barSubKategori}
                  onChange={handleInputChange}
                  disabled={!formData.barKategori}
                />
              </div>
              <div className="col-lg-6">
                <DropDown
                  forInput="barSatuan"
                  label="Satuan"
                  arrData={listSatuan}
                  value={formData.barSatuan}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-lg-12 mt-3">
                <LabelImages
                  forLabel="barFoto"
                  title="Foto"
                  image={formData.barFoto}
                  data={
                    formData.barFoto ? (
                      <a
                        href={FILE_LINK + formData.barFoto}
                        className="text-decoration-none"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Lihat Gambar
                      </a>
                    ) : (
                      "-"
                    )
                  }
                />
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
          <Button
            classType="primary ms-2 px-4 py-2"
            type="submit"
            label="SIMPAN PERUBAHAN"
          />
        </div>
      </form>
    </>
  );
}
import { useEffect, useRef, useState } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import UploadFile from "../../util/UploadFile";
import Button from "../../part/Button";
import DropDown from "../../part/Dropdown";
import Input from "../../part/Input";
import FileUpload from "../../part/FileUpload";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

export default function MasterMaterialAdd({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [listKategori, setListKategori] = useState([]);
  const [listSubKategori, setListSubKategori] = useState([]);
  const [listSatuan, setListSatuan] = useState([]);

  const API_BASE = "MasterPart/";

  const formDataRef = useRef({
    barNama: "",
    barKategori: "",
    barSubKategori: "",
    barSatuan: "",
    barFoto: "",
    barSpesifikasi: "",
  });

  const fileFotoRef = useRef(null);

  const userSchema = object({
    barNama: string().required("harus diisi"),
    barKategori: string().required("harus diisi"),
    barSubKategori: string().required("harus diisi"),
    barSatuan: string().required("harus diisi"),
    barFoto: string(),
    barSpesifikasi: string(),
  });

  const fetchData = async (endpoint, params, setter, errorMessage) => {
    setIsError({ error: false, message: "" });
    try {
      const data = await UseFetch(endpoint, params);
      if (data === "ERROR") throw new Error(errorMessage);
      setter(data);
    } catch (error) {
      setIsError({ error: true, message: error.message });
      setter([]);
    }
  };

  useEffect(() => {
    fetchData(
      API_LINK + "Utilities/" + "GetListKategori",
      {},
      (data) => {
        // console.log("Kategori result:", data);
        setListKategori(data);
      },
      "Gagal mengambil daftar kategori."
    );

    fetchData(
      API_LINK + "Utilities/" + "GetListSatuan",
      {},
      (data) => {
        // console.log("Kategori result:", data);
        setListSatuan(data);
      },
      "Gagal mengambil daftar satuan."
    );
  }, []);

  // const handleKategoriChange = async (e) => {
  //   const { value } = e.target;
  //   formDataRef.current.barKategori = value;
  //   formDataRef.current.barSubKategori = "";
  //   setErrors((prev) => ({ ...prev, barSubKategori: "" }));

  //   if (value) {
  //     await fetchData(
  //       API_LINK + API_BASE + "GetListSubKategori",
  //       { kategoriID: Number(value) },
  //       setListSubKategori,
  //       "Gagal mengambil daftar subkategori."
  //     );
  //   } else {
  //     setListSubKategori([]);
  //   }
  // };

  const handleKategoriChange = async (value) => {
    formDataRef.current.barKategori = value;
    formDataRef.current.barSubKategori = "";
    setErrors((prev) => ({ ...prev, barSubKategori: "" }));

    if (value) {
      await fetchData(
        API_LINK + API_BASE + "GetListSubKategori",
        { kategoriID: Number(value) },
        setListSubKategori,
        "Gagal mengambil daftar subkategori."
      );
    } else {
      setListSubKategori([]);
    }
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    const validationError = await validateInput(name, value, userSchema);
    formDataRef.current[name] = value;
    setErrors((prev) => ({
      ...prev,
      [validationError.name]: validationError.error,
    }));
  };

  const handleFileChange = async (ref, extAllowed) => {
    const { name } = ref.current;
    const file = ref.current.files[0];

    if (!file) {
      setErrors((prev) => ({ ...prev, [name]: "Berkas diperlukan" }));
      return;
    }

    const fileName = file.name;
    const fileSize = file.size;
    const fileExt = fileName.split(".").pop().toLowerCase();
    let error = "";

    if (fileSize / 1024576 > 10) error = "Berkas terlalu besar (maks 10MB)";
    else if (!extAllowed.split(",").includes(fileExt))
      error = "Format berkas tidak valid";

    if (error) ref.current.value = "";

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);
      setIsError({ error: false, message: "" });

      try {
        let gambar = "";
        if (fileFotoRef.current && fileFotoRef.current.files.length > 0) {
          const fotoData = await UploadFile(fileFotoRef.current);
          if (fotoData !== "ERROR" && fotoData?.Hasil) {
            gambar = fotoData.Hasil;
          }
        }

        // Siapkan payload sesuai API baru
        const payload = {
          ID: null, // create = null
          Nama: formDataRef.current.barNama,
          Gambar: gambar,
          KategoriID: Number(formDataRef.current.barKategori),
          SubKategoriID: Number(formDataRef.current.barSubKategori),
          SatuanID: formDataRef.current.barSatuan,
          Spesifikasi: formDataRef.current.barSpesifikasi,
        };

        const data = await UseFetch(
          API_LINK + API_BASE + "SaveEditDraftPartNumber",
          payload
        );

        if (data === "ERROR") throw new Error("Gagal menyimpan data material");

        SweetAlert("Sukses", "Data material berhasil disimpan", "success");
        onChangePage("index");
      } catch (error) {
        setIsError({
          error: true,
          message: error.message || "Terjadi kesalahan saat menyimpan data",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isLoading) return <Loading />;

  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}
      <form onSubmit={handleAdd}>
        <div className="card">
          <div className="card-header bg-primary fw-medium text-white">
            Tambah Data Material
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-6">
                <Input
                  type="text"
                  forInput="barNama"
                  label="Nama Material"
                  isRequired
                  value={formDataRef.current.barNama}
                  onChange={handleInputChange}
                  errorMessage={errors.barNama}
                />
              </div>
              <div className="col-lg-6">
                <Input
                  type="text"
                  forInput="barSpesifikasi"
                  label="Spesifikasi Material"
                  value={formDataRef.current.barSpesifikasi}
                  onChange={handleInputChange}
                  errorMessage={errors.barSpesifikasi}
                />
              </div>

              <div className="col-lg-6">
                <DropDown
                  forInput="barKategori"
                  label="Kategori"
                  isRequired
                  arrData={listKategori.map((k) => ({
                    value: k.ID,
                    label: k.Kode + " " + k["Nama Kategori"],
                  }))}
                  value={formDataRef.current.barKategori}
                  onChange={(value) => {
                    formDataRef.current.barKategori = value;
                    handleKategoriChange(value);
                  }}
                  errorMessage={errors.barKategori}
                />
              </div>
              <div className="col-lg-6">
                <DropDown
                  forInput="barSubKategori"
                  label="Sub Kategori"
                  isRequired
                  arrData={listSubKategori.map((sk) => ({
                    value: sk.ID,
                    label: sk.Kode + " " + sk["Nama Subkategori"],
                  }))}
                  value={formDataRef.current.barSubKategori}
                  onChange={(value) => {
                    formDataRef.current.barSubKategori = value;
                    handleInputChange({
                      target: { name: "barSubKategori", value },
                    });
                  }}
                  errorMessage={errors.barSubKategori}
                  disabled={!formDataRef.current.barKategori}
                />
              </div>
              <div className="col-lg-6">
                <DropDown
                  forInput="barSatuan"
                  label="Satuan"
                  isRequired
                  arrData={listSatuan.map((s) => ({
                    value: s.Nama,
                    label: s.Nama,
                  }))}
                  value={formDataRef.current.barSatuan}
                  onChange={(value) => {
                    formDataRef.current.barSatuan = value;
                    handleInputChange({ target: { name: "barSatuan", value } });
                  }}
                  errorMessage={errors.barSatuan}
                />
              </div>
              <div className="col-lg-6 mt-3">
                <FileUpload
                  forInput="barFoto"
                  label="Foto (.jpeg, .jpg, .png)"
                  formatFile=".jpeg,.jpg,.png"
                  ref={fileFotoRef}
                  onChange={() => handleFileChange(fileFotoRef, "jpeg,jpg,png")}
                  errorMessage={errors.barFoto}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="float-end my-4 mx-1">
          <Button
            classType="secondary me-2 px-4 py-2"
            label="BATAL"
            onClick={() => onChangePage("index")}
          />
          <Button
            classType="primary ms-2 px-4 py-2"
            type="submit"
            label="SIMPAN"
          />
        </div>
      </form>
    </>
  );
}

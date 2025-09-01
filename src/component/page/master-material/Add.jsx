import { useEffect, useRef, useState } from "react";
import { object, string, number } from "yup";
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

export default function MasterKategoriAdd({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [listKategori, setListKategori] = useState({});
  const [listPemilik, setListPemilik] = useState({});
  const [listSatuan, setListSatuan] = useState({});
  const [listVendor, setListVendor] = useState({});
  const [listCustomer, setListCustomer] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("");
  const [listJenis, setListJenis] = useState({});
  const path = window.location.pathname;

  const formDataRef = useRef({
    barKategori: "",
    barNama: "",
    barFoto: "",
    barSpesifikasi: "",
    barMerk: "",
    barSatuan: "",
    barMinStok: 0,
    barPemilik: "",
    barCustomer: "",
    barJumlahPerBox: 0,
    barJenis: "",
    barVendor: "",
    barLokasi: "",
    barBin: "",
    barRak: "",
  });

  const fileFotoRef = useRef(null);

  const userSchema = object({
    barNama: string().required("harus diisi"),
    barKategori: string().required("harus diisi"),
    barFoto: string(),
    barSpesifikasi: string().required("harus diisi"),
    barMerk: string().required("harus diisi"),
    barSatuan: string().required("harus diisi"),
    barMinStok: number().typeError("masukkan angka yang valid"),
    barJumlahPerBox: number().typeError("masukkan angka yang valid"),
    barPemilik: string().required("harus diisi"),
    barCustomer: string(),
    barVendor: string(),
    barJenis: string(),
    barLokasi: string(),
    barRak: string(),
    barBin: string(),
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
      setter({});
    }
  };

  useEffect(() => {
    fetchDataByEndpointAndParams(
      API_LINK + "Utilities/GetListKategori",
      {},
      setListKategori,

      "Terjadi kesalahan: Gagal mengambil daftar kategori."
    );
  }, []);

  useEffect(() => {
    fetchDataByEndpointAndParams(
      API_LINK + "Utilities/GetListPemilik",
      {},
      setListPemilik,

      "Terjadi kesalahan: Gagal mengambil daftar pemilik."
    );
  }, []);

  useEffect(() => {
    fetchDataByEndpointAndParams(
      API_LINK + "Utilities/GetListSatuan",
      {},
      setListSatuan,

      "Terjadi kesalahan: Gagal mengambil daftar satuan."
    );
  }, []);

  useEffect(() => {
    fetchDataByEndpointAndParams(
      API_LINK + "Utilities/GetListVendor",
      {},
      setListVendor,

      "Terjadi kesalahan: Gagal mengambil daftar vendor."
    );
  }, []);

  useEffect(() => {
    fetchDataByEndpointAndParams(
      API_LINK + "Utilities/GetListCustomer",
      {},
      setListCustomer,

      "Terjadi kesalahan: Gagal mengambil daftar customer."
    );
  }, []);

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    var validationError = await validateInput(name, value, userSchema);
    formDataRef.current[name] = value;

    if (name === "barMinStok" || name === "barJumlahPerBox") {
      if (!/^[0-9]*$/.test(value) || value < 0) {
        validationError = {
          name,
          error: "Input tidak valid: hanya angka yang diizinkan dan tidak boleh minus",
        };
      }
    }
  
    if (name === "barKategori") {
      setSelectedCategory(value);

      fetchDataByEndpointAndParams(
        API_LINK + "Utilities/GetListJenisByKategori",
        { kategori: value },
        setListJenis,

        "Terjadi kesalahan: Gagal mengambil daftar jenis."
      );
    }
    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

  const handlePaste = (e) => {
    const paste = (e.clipboardData || window.Clipboard).getData('text');
    const isValid = /^[0-9]*$/.test(paste); // Hanya izinkan angka
  
    if (!isValid || paste < 0) {
      e.preventDefault();
      SweetAlert("Error", "Input tidak valid: hanya angka yang diizinkan dan tidak boleh -1", "error");
    }
  };
  

  const handleFileChange = async (ref, extAllowed) => {
    const { name, value } = ref.current;
    const file = ref.current.files[0];
    const fileName = file.name;
    const fileSize = file.size;
    const fileExt = fileName.split(".").pop();
    const validationError = await validateInput(name, value, userSchema);
    let error = "";

    if (fileSize / 1024576 > 10) error = "berkas terlalu besar";
    else if (!extAllowed.split(",").includes(fileExt))
      error = "format berkas tidak valid";

    if (error) ref.current.value = "";

    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: error,
    }));
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
      setIsError((prevError) => ({ ...prevError, error: false }));
      setErrors({});

      const uploadPromises = [];

      const fileInputs = [{ ref: fileFotoRef, key: "barFoto" }];

      fileInputs.forEach((fileInput) => {
        if (fileInput.ref.current.files.length > 0) {
          uploadPromises.push(
            UploadFile(fileInput.ref.current).then(
              (data) => (formDataRef.current[fileInput.key] = data.Hasil)
            )
          );
        }
      });

      try {
        await Promise.all(uploadPromises);

        const data = await UseFetch(
          API_LINK + "MasterMaterial/CreateMaterial",
          formDataRef.current
        );

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal menyimpan data material.");
        } else {
          SweetAlert("Sukses", "Data material berhasil disimpan", "success");
          onChangePage("index");
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
            Tambah Data Barang
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-4">
                <FileUpload
                  forInput="barFoto"
                  label="Foto (.jpeg, .jpg, .png)"
                  formatFile=".jpeg,.jpg,.png"
                  ref={fileFotoRef}
                  onChange={() => handleFileChange(fileFotoRef, "jpeg,jpg,png")}
                  errorMessage={errors.barFoto}
                />
              </div>
              <div className="col-lg-4">
                <DropDown
                  forInput="barKategori"
                  label="Kategori"
                  isRequired
                  arrData={listKategori}
                  value={formDataRef.current.barKategori}
                  onChange={handleInputChange}
                  errorMessage={errors.barKategori}
                />
              </div>
              <div className="col-lg-4">
                <Input
                  type="text"
                  forInput="barNama"
                  label="Nama"
                  isRequired
                  value={formDataRef.current.barNama}
                  onChange={handleInputChange}
                  errorMessage={errors.barNama}
                />
              </div>
              {(selectedCategory === "CONSUMABLE" ||
                selectedCategory == "MATERIAL") && (
                <div className="col-lg-4">
                  <DropDown
                    forInput="barJenis"
                    label="Jenis"
                    arrData={listJenis}
                    value={formDataRef.current.barJenis}
                    onChange={handleInputChange}
                    errorMessage={errors.barJenis}
                  />
                </div>
              )}
              <div className="col-lg-4">
                <Input
                  type="text"
                  forInput="barSpesifikasi"
                  label="Spesifikasi"
                  isRequired
                  value={formDataRef.current.barSpesifikasi}
                  onChange={handleInputChange}
                  errorMessage={errors.barSpesifikasi}
                />
              </div>
              <div className="col-lg-4">
                <Input
                  type="text"
                  forInput="barMerk"
                  label="Merk"
                  isRequired
                  value={formDataRef.current.barMerk}
                  onChange={handleInputChange}
                  errorMessage={errors.barMerk}
                />
              </div>
              <div className="col-lg-4">
                <Input
                  type="number"
                  forInput="barMinStok"
                  label="Stok Minimal"
                  value={parseInt(formDataRef.current.barMinStok)}
                  onChange={handleInputChange}
                  onPaste={handlePaste}
                  errorMessage={errors.barMinStok}
                />
              </div>
              <div className="col-lg-4">
                <DropDown
                  forInput="barPemilik"
                  label="Pemilik"
                  isRequired
                  arrData={listPemilik}
                  value={formDataRef.current.barPemilik}
                  onChange={handleInputChange}
                  errorMessage={errors.barPemilik}
                />
              </div>
              <div className="col-lg-4">
                <DropDown
                  forInput="barSatuan"
                  label="Satuan"
                  isRequired
                  arrData={listSatuan}
                  value={formDataRef.current.barSatuan}
                  onChange={handleInputChange}
                  errorMessage={errors.barSatuan}
                />
              </div>
              {(selectedCategory === "MASSPRO FG" ||
                selectedCategory == "PRODUCTION FG") && (
                <>
                  <div className="col-lg-4">
                    <DropDown
                      forInput="barCustomer"
                      label="Nama Pelanggan"
                      arrData={listCustomer}
                      value={formDataRef.current.barCustomer}
                      onChange={handleInputChange}
                      errorMessage={errors.barCustomer}
                    />
                  </div>
                  <div className="col-lg-4">
                    <Input
                      type="number"
                      forInput="barJumlahPerBox"
                      label="Jumlah Perbox"
                      value={parseInt(formDataRef.current.barJumlahPerBox)}
                      onChange={handleInputChange}
                      onPaste={handlePaste}
                      errorMessage={errors.barJumlahPerBox}
                    />
                  </div>
                </>
              )}
              {selectedCategory === "MASSPRO RAW" && (
                <>
                  <div className="col-lg-4">
                    <DropDown
                      forInput="barVendor"
                      label="Nama Vendor"
                      arrData={listVendor}
                      value={formDataRef.current.barVendor}
                      onChange={handleInputChange}
                      errorMessage={errors.barVendor}
                    />
                  </div>
                  <div className="col-lg-4">
                    <Input
                      type="number"
                      forInput="barJumlahPerBox"
                      label="Jumlah Perbox"
                      value={
                        parseInt(formDataRef.current.barJumlahPerBox) === 0
                          ? 1
                          : parseInt(formDataRef.current.barJumlahPerBox)
                      }
                      onChange={handleInputChange}
                      onPaste={handlePaste}
                      errorMessage={errors.barJumlahPerBox}
                    />
                  </div>
                </>
              )}
              {path === "/master_material_gudang" && (
                <>
                  <div className="col-lg-4">
                    <Input
                      type="text"
                      forInput="barLokasi"
                      label="Lokasi"
                      value={formDataRef.current.barLokasi}
                      onChange={handleInputChange}
                      errorMessage={errors.barLokasi}
                    />
                  </div>
                  <div className="col-lg-4">
                    <Input
                      type="text"
                      forInput="barRak"
                      label="Rak"
                      value={formDataRef.current.barRak}
                      onChange={handleInputChange}
                      errorMessage={errors.barRak}
                    />
                  </div>
                  <div className="col-lg-4">
                    <Input
                      type="text"
                      forInput="barBin"
                      label="Bin"
                      value={formDataRef.current.barBin}
                      onChange={handleInputChange}
                      errorMessage={errors.barBin}
                    />
                  </div>
                </>
              )}
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

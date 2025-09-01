import { useEffect, useRef, useState } from "react";
import { object, string } from "yup";
import { API_LINK, FILE_LINK } from "../../util/Constants";
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

export default function MasterMaterialEdit({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [listSatuan, setListSatuan] = useState([]);
  const [formData, setFormData] = useState({
    ID: withID,
    Nama: "",
    Spesifikasi: "",
    SatuanID: "",
    Kategori: "",
    SubKategori: "",
    PartNumber: "",
    Gambar: "",
  });

  const fileFotoRef = useRef(null);

  const API_BASE = "MasterPart/";

  // Schema validation
  const userSchema = object({
    Nama: string().required("Nama material harus diisi"),
    Spesifikasi: string(),
    SatuanID: string().required("Satuan harus dipilih"),
  });

  const fetchData = async (endpoint, params, errorMessage) => {
    setIsError({ error: false, message: "" });
    try {
      const data = await UseFetch(endpoint, params);
      if (data === "ERROR") throw new Error(errorMessage);
      return data;
    } catch (error) {
      setIsError({ error: true, message: error.message });
      return null;
    }
  };

  // Ambil data satuan
  useEffect(() => {
    const getSatuan = async () => {
      const data = await fetchData(
        API_LINK + "Utilities/GetListSatuan",
        {},
        "Gagal mengambil daftar satuan"
      );
      if (data) setListSatuan(data);
    };
    getSatuan();
  }, []);

  // Ambil data material berdasarkan ID
  useEffect(() => {
    const fetchMaterialData = async () => {
      if (!withID) {
        // console.error("No ID provided for edit");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const data = await fetchData(
          API_LINK + API_BASE + "GetListPartNumber",
          { partNumber: withID },
          "Gagal mengambil data material"
        );

        if (!data || data.length === 0) {
          throw new Error("Data material tidak ditemukan");
        }

        const material = data[0];
        // console.log("Material data:", material);

        setFormData({
          ID: material.ID || withID,
          Nama: material.Nama || "",
          Spesifikasi: material.Spesifikasi || "",
          SatuanID: material.Satuan || "",
          Kategori: material.Kategori || "",
          SubKategori: material["Sub Kategori"] || "",
          PartNumber: material["Part Number"] || "",
          Gambar: material.Gambar || "",
        });
      } catch (error) {
        setIsError({
          error: true,
          message: error.message || "Gagal memuat data material",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaterialData();
  }, [withID]);

  const handleInputChange = async (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (userSchema.fields[name]) {
      const validationError = await validateInput(name, value, userSchema);
      setErrors((prev) => ({
        ...prev,
        [name]: validationError.error,
      }));
    }
  };

  const handleDropdownChange = async (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (userSchema.fields[name]) {
      const validationError = await validateInput(name, value, userSchema);
      setErrors((prev) => ({
        ...prev,
        [name]: validationError.error,
      }));
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setIsError({
          error: true,
          message: "Format file tidak didukung. Gunakan JPG, PNG, atau GIF."
        });
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setIsError({
          error: true,
          message: "Ukuran file terlalu besar. Maksimal 5MB."
        });
        return;
      }

      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };



  // Remove image
  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setFormData(prev => ({
      ...prev,
      Gambar: ""
    }));
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Validasi form
      const schemaKeys = Object.keys(userSchema.fields ?? {});
      const dataToValidate = schemaKeys.reduce((acc, key) => {
        acc[key] = formData[key];
        return acc;
      }, {});

      const validationErrors = await validateAllInputs(
        dataToValidate,
        userSchema,
        setErrors
      );

      const hasValidationErrors = Object.values(validationErrors ?? {}).some(
        (v) => Boolean(v)
      );

      if (hasValidationErrors) {
        setIsError({
          error: true,
          message: "Terdapat kesalahan pada form. Silakan periksa kembali.",
        });
        return;
      }

      setIsError({ error: false, message: "" });

      // Upload foto baru jika ada (following Add component pattern)
      let gambar = formData.Gambar; // Keep existing image
      if (fileFotoRef.current && fileFotoRef.current.files.length > 0) {
        const fotoData = await UploadFile(fileFotoRef.current);
        if (fotoData !== "ERROR" && fotoData?.Hasil) {
          gambar = fotoData.Hasil;
        }
      }

      const payload = {
        id: formData.ID.toString(),
        nama: formData.Nama,
        satuanID: formData.SatuanID,
        spesifikasi: formData.Spesifikasi,
        gambar: gambar,
      };

      // console.log("Payload:", payload);

      const save = await UseFetch(
        API_LINK + API_BASE + "EditPartNumber",
        payload
      );

      if (save === "ERROR") {
        throw new Error("Gagal menyimpan perubahan data material");
      }

      SweetAlert("Sukses", "Data material berhasil diperbarui", "success");
      onChangePage("index");
    } catch (error) {
      setIsError({
        error: true,
        message: error.message || "Terjadi kesalahan saat menyimpan perubahan",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid = () => {
    return formData.Nama.trim() !== "" && formData.SatuanID !== "";
  };

  if (isLoading) return <Loading />;

  return (
    <>
      {isError.error && <Alert type="danger" message={isError.message} />}

      <form onSubmit={handleEdit}>
        <div className="card">
          <div className="card-header bg-primary fw-medium text-white">
            Ubah Data Material
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-6">
                <Input
                  type="text"
                  name="PartNumber"
                  label="Part Number"
                  value={formData.PartNumber}
                  readOnly
                  disabled
                />
              </div>
              <div className="col-lg-6">
                <Input
                  type="text"
                  name="Nama"
                  label="Nama Material"
                  required
                  value={formData.Nama}
                  onChange={handleInputChange}
                  errorMessage={errors.Nama}
                />
              </div>

              <div className="col-lg-6">
                <Input
                  type="text"
                  name="Spesifikasi"
                  label="Spesifikasi Material"
                  value={formData.Spesifikasi}
                  onChange={handleInputChange}
                  errorMessage={errors.Spesifikasi}
                />
              </div>

              <div className="col-lg-6">
                <DropDown
                  name="SatuanID"
                  label="Satuan"
                  required
                  arrData={listSatuan.map((s) => ({
                    value: s.Nama,
                    label: s.Nama,
                  }))}
                  value={formData.SatuanID}
                  onChange={(value) => handleDropdownChange("SatuanID", value)}
                  errorMessage={errors.SatuanID}
                />
              </div>

              <div className="col-lg-6">
                <Input
                  type="text"
                  name="Kategori"
                  label="Kategori"
                  value={formData.Kategori}
                  readOnly
                  disabled
                />
              </div>

              <div className="col-lg-6">
                <Input
                  type="text"
                  name="SubKategori"
                  label="Sub Kategori"
                  value={formData.SubKategori}
                  readOnly
                  disabled
                />
              </div>

              <div className="col-lg-12">
                <div className="mb-3">
                  <label className="form-label">Foto Material</label>
                  
                  {/* Current Image Display */}
                  {formData.Gambar && (
                    <div className="border p-3 mb-3">
                      <div className="text-center">
                        <img
                          src={`${FILE_LINK}${formData.Gambar}`}
                          alt="Foto Material"
                          style={{ 
                            maxHeight: "200px", 
                            maxWidth: "100%",
                            objectFit: "contain",
                            borderRadius: "4px"
                          }}
                        />
                      </div>
                      <div className="mt-2 d-flex justify-content-center">
                        {/* <Button
                          classType="danger btn-sm"
                          label="Hapus Foto Existing"
                          onClick={handleRemoveImage}
                          type="button"
                          disabled={isSaving}de
                        /> */}
                      </div>
                    </div>
                  )}

                  {/* File Upload Component */}
                  <FileUpload
                    forInput="barFoto"
                    label="Upload Foto Baru (.jpeg, .jpg, .png)"
                    formatFile=".jpeg,.jpg,.png"
                    ref={fileFotoRef}
                    onChange={() => handleFileChange(fileFotoRef, "jpeg,jpg,png")}
                    errorMessage={errors.barFoto}
                  />
                  
                  <small className="form-text text-muted">
                    Upload foto baru jika ingin mengganti foto existing. Maksimal 10MB.
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="float-end my-4 mx-1">
          <Button
            classType="secondary me-2 px-4 py-2"
            label="BATAL"
            onClick={() => onChangePage("index")}
            disabled={isSaving}
          />
          <Button
            classType="primary ms-2 px-4 py-2"
            type="submit"
            label={isSaving ? "MENYIMPAN..." : "SIMPAN"}
            disabled={isSaving || !isFormValid()}
          />
        </div>
      </form>
    </>
  );
}
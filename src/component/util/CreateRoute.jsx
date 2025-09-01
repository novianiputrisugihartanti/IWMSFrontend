import { lazy } from "react";

const LandingPage = lazy(() => import("../page/landing-page/Index"));
const Beranda = lazy(() => import("../page/beranda/Root"));
const MasterMaterial = lazy(() => import("../page/master-material-2/Root"));
const TransaksiPenerimaanBarang = lazy(() => import("../page/penerimaan-barang/Root"));
const TransaksiPengambilanBarang = lazy(() => import("../page/pengambilan-barang/Root"));
const PenerbitanSuratJalan = lazy(() => import("../page/penerbitan-surat-jalan/Root"));
const TransaksiBuktiPengambilanBarang = lazy(() => import("../page/bukti-pengambilan-barang/Root"));
const LaporanPergerakanBarang = lazy(() => import("../page/pergerakan-barang/Root"));

const routeList = [
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/beranda",
    element: <Beranda />,
  },
  {
    path: "/master_material",
    element: <MasterMaterial />,
  },
  {
    path: "/master_material_gudang",
    element: <MasterMaterial />,
  },
  {
    path: "/penerimaan_barang",
    element: <TransaksiPenerimaanBarang />,
  },
  {
    path: "/pengambilan_barang",
    element: <TransaksiPengambilanBarang />,
  },
  {
    path: "/penerbitan_surat_jalan",
    element: <PenerbitanSuratJalan />,
  },
  {
    path: "/bukti_pengambilan_barang",
    element: <TransaksiBuktiPengambilanBarang/>,
  },
  {
    path: "/laporan_pengambilan_barang",
    element: <TransaksiBuktiPengambilanBarang/>,
  },
  {
    path: "/pergerakan_barang",
    element: <LaporanPergerakanBarang/>,
  },
  {
    path: "/pergerakan_barang_masspro",
    element: <LaporanPergerakanBarang/>,
  }
];

export default routeList;

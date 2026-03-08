import { ThemeConfig } from "antd";

const theme: ThemeConfig = {
  token: {
    colorPrimary: "#000000",
    borderRadius: 3,
    fontFamily: "var(--font-baiJamjuree), var(--font-hindSiliguri)",
  },
  components: {
    Collapse: {
      contentBg: "#fff",
      headerBg: "#fff",
    },
    Checkbox: {
      colorBorder: "gray",
    },
    Rate: {
      starSize: 13,
      starColor: "#404040",
    },
  },
};

export { theme };

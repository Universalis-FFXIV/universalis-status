import { Box, BoxProps, Link } from "@mui/material";

export interface UniversalisFooterProps extends BoxProps {}

export const UniversalisFooter = ({ ...boxProps }: UniversalisFooterProps) => {
  return (
    <Box {...boxProps}>
      <footer
        style={{
          fontFamily: "Roboto",
          textAlign: "center",
          fontSize: "15px",
          lineHeight: "22px",
        }}
      >
        <small>
          <div>
            Universalis v2, based on Mogboard v2.2
            &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
            <Link href="/about" color={"#9ab9fa"} underline="none">
              About
            </Link>
            &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
            <Link href="/" color={"#9ab9fa"} underline="none">
              Service Status
            </Link>
            &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
            <Link
              href="https://docs.universalis.app"
              color={"#9ab9fa"}
              underline="none"
            >
              API Documentation
            </Link>
            &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
            <Link
              href="https://github.com/Universalis-FFXIV/Universalis"
              color={"#9ab9fa"}
              underline="none"
            >
              GitHub
            </Link>
            &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
            <Link
              href="https://discord.gg/JcMvMxD"
              color={"#9ab9fa"}
              underline="none"
            >
              Discord
            </Link>
          </div>
          <div>
            FINAL FANTASY XIV © 2010 - 2020 SQUARE ENIX CO., LTD. All Rights
            Reserved.
          </div>
        </small>
      </footer>
    </Box>
  );
};

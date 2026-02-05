import { Drawer } from "@mui/material";
import React from "react";
import type { SxProps, Theme } from "@mui/material/styles";

function DrawerComponent({
  isOpen,
  anchor,
  children,
  closeDrawer,
  paperSx,
}: {
  isOpen: boolean;
  anchor: "top" | "left" | "bottom" | "right";
  children: React.ReactNode;
  closeDrawer: () => void;
  paperSx?: SxProps<Theme>;
}) {
  const basePaperSx: SxProps<Theme> = {
    boxSizing: "border-box",
    width: anchor === "left" || anchor === "right" ? 360 : "100%",
    height: anchor === "top" || anchor === "bottom" ? "60dvh" : "100dvh",
    display: "flex",
    flexDirection: "column",
  };

  // ✅ gabungkan tanpa memasukkan undefined
  const mergedPaperSx: SxProps<Theme> = Array.isArray(paperSx)
    ? [basePaperSx, ...paperSx]
    : paperSx
    ? [basePaperSx, paperSx]
    : basePaperSx;

  return (
    <Drawer
      anchor={anchor}
      open={isOpen}
      onClose={closeDrawer}
      slotProps={{ paper: { sx: mergedPaperSx } }}
    >
      {children}
    </Drawer>
  );
}

export default DrawerComponent;

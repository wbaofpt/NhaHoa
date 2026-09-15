export type OccasionCard = {
  name: string;
  caption: string;
  image: string;
};

export const occasionDefaults: OccasionCard[] = [
  { name: "Sinh nhật", caption: "Thêm một tuổi, thêm niềm vui", image: "pink" },
  { name: "Tình yêu", caption: "Thay lời muốn nói", image: "rose" },
  { name: "Chúc mừng", caption: "Cho những khởi đầu rực rỡ", image: "sunshine" },
  { name: "Cảm ơn", caption: "Gửi một chút chân thành", image: "garden" },
];

export const OCCASIONS_KEY = "nha-hoa-home-occasions";

export function readOccasions(): OccasionCard[] {
  try {
    const value = JSON.parse(localStorage.getItem(OCCASIONS_KEY) || "null");
    return Array.isArray(value) && value.length ? value : occasionDefaults;
  } catch {
    return occasionDefaults;
  }
}

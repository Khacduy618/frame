# Theme: Đà Nẵng — bộ ảnh và chữ cho frame

Bỏ ảnh vào `assets/`, sửa chữ trong `copy.md`. Skill `peak-frame-designer` đọc thư mục này trước
khi dựng frame, và dùng đúng các file ở đây (không tự lấy ảnh khác).

## Chữ (`copy.md`)

Mọi dòng chữ trên frame lấy nguyên văn từ `copy.md`. Để trống (hoặc ghi `key;`) = không dùng.
Tuỳ chọn thêm:

- `signpost: MÌ QUẢNG, BÁNH XÈO, BÚN MẮM NÊM, BÁNH TRÁNG CUỐN` — chữ trên biển chỉ đường (food scrapbook).

## Ảnh (`assets/`, không có trong git)

Các thiết kế dùng ảnh thật tìm các file sau (khớp tên đầu tiên):

| Thiết kế | File | Tối thiểu | Dùng làm |
|---|---|---|---|
| journal | `beach.jpeg` | rộng 736 px | thẻ bờ biển (600 px) |
| journal | `caurongdanang.jpeg` | crop rộng 707 px | thẻ Cầu Rồng (700 px) |
| journal | `dau-rong.png` | rộng 600 px, nền trong suốt | đầu rồng cắt nền |
| journal, airmail | `stamp-dragon-bridge.jpeg` (hoặc tên gốc dài) | rộng 360 px | tem cổ |

Quy tắc cho ảnh mới:

| Vai trò | Tối thiểu (px) | Ghi chú |
|---|---|---|
| Ảnh chính (tràn ngang) | rộng 2504 | không chữ, không watermark |
| Thẻ ảnh lớn | rộng 1300 | |
| Thẻ ảnh nhỏ | rộng 900 | |
| Sticker | ≥ 2× kích thước dùng | PNG nền trong suốt, **không viền trắng** |
| Texture | 2504 × 3732 | không trắng / xám nhạt |

In 600 DPI: 1000 px trên trang = 42 mm trên giấy. Ảnh nhỏ hơn kích thước dùng sẽ phải phóng to và
bị mờ, nên tool không cho phóng to.

Ghi nguồn, tác giả và người cho phép cho từng file vào `assets/SOURCES.md`. Mọi file trong
`assets/` (trừ `SOURCES.md`) bị git bỏ qua (`themes/.gitignore`): đó là tranh/ảnh của bên thứ ba
và repo này công khai.

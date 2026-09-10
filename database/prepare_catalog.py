"""Download demo floral photography and create MongoDB JSON catalog seeds."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import urllib.request
import json

ROOT = Path(__file__).resolve().parents[1]
PHOTOS = [
 ('hero','photo-1563241527-3004b7be0ffd'),
 ('rose','photo-1644248423203-80e317d78aee'),
 ('pink','photo-1525310072745-f49212b5ac6d'),
 ('tulip','photo-1520763185298-1b434c919102'),
 ('sunshine','photo-1457089328109-e5d9bd499191'),
 ('garden','photo-1490750967868-88aa4486c946'),
 ('white','photo-1563241527-3004b7be0ffd'),
 ('peony','photo-1563241527-3004b7be0ffd'),
 ('story','photo-1441974231531-c6227db76b6e'),
]
def download(item):
 name, photo = item
 target = ROOT / 'frontend/public/images' / (name + '.jpg')
 if target.exists(): return
 url = f'https://images.unsplash.com/{photo}?auto=format&fit=crop&w={1600 if name == "hero" else 1000}&q=85'
 try:
  urllib.request.urlretrieve(url, target)
  print(name, target.stat().st_size)
 except Exception as error: print(name, str(error))
with ThreadPoolExecutor(max_workers=5) as executor: list(executor.map(download, PHOTOS))

products = [
 ('nang-tho','Nàng thơ','Bó hoa','Tình yêu',550000,650000,'rose','Hồng pastel dịu dàng, gói trong những lớp giấy màu kem. Một lời thương nhẹ nhàng dành cho người bạn luôn nghĩ đến.','Hồng pastel, cẩm chướng, lá bạc','Được yêu thích'),
 ('som-mai','Sớm mai','Bó hoa','Sinh nhật',420000,None,'tulip','Một chút trong veo của buổi sớm, gửi đến người thương bằng những cánh tulip mềm mại.','Tulip theo mùa, lá xanh','Mới về'),
 ('cham-vao-ha','Chạm vào hạ','Bó hoa','Chúc mừng',480000,None,'sunshine','Sắc hoa rực rỡ như một ngày đầy nắng. Dành tặng những khởi đầu mới và niềm vui vừa chớm.','Hoa theo mùa, cúc, lá phụ',None),
 ('hong-may','Hồng mây','Giỏ hoa','Sinh nhật',750000,850000,'pink','Những sắc hồng đan xen, vừa ngọt ngào vừa tự nhiên. Giỏ hoa được cắm tay để từng bông có khoảng thở riêng.','Hồng, cẩm tú cầu, hoa phụ','Bán chạy'),
 ('khu-vuon-nho','Khu vườn nhỏ','Bình hoa','Cảm ơn',690000,None,'garden','Mang một góc vườn vào không gian sống. Hoa theo mùa kết hợp tự nhiên trong bình thủy tinh.','Hoa vườn theo mùa, lá xanh',None),
 ('loi-yeu','Lời yêu','Bó hoa','Tình yêu',890000,None,'rose','Một bó hồng đầy đặn thay cho những lời khó nói. Gói tặng trang nhã, kèm thiệp viết tay.','Hồng cao cấp, lá bạc','Được yêu thích'),
 ('trong-veo','Trong veo','Bình hoa','Cảm ơn',590000,None,'white','Sắc trắng tinh khôi làm dịu một ngày bận rộn. Thiết kế thanh lịch phù hợp bàn làm việc và phòng khách.','Hoa trắng theo mùa, lá phụ',None),
 ('ngay-chung-doi','Ngày chung đôi','Hoa cưới','Ngày cưới',1250000,None,'peony','Bó hoa cầm tay với dáng tròn tự nhiên, gam màu thanh nhã dành cho ngày đặc biệt của hai người.','Hoa hồng vườn, hoa theo mùa','Đặt trước'),
 ('gui-binh-yen','Gửi bình yên','Giỏ hoa','Cảm ơn',650000,None,'garden','Một giỏ hoa mộc mạc, bình dị và đầy sức sống. Gửi lời cảm ơn từ những điều nhỏ nhất.','Hoa cúc, hoa vườn, lá xanh',None),
 ('nang-trong-tim','Nắng trong tim','Giỏ hoa','Chúc mừng',950000,None,'sunshine','Thiết kế đầy sức sống cho ngày khai trương, tốt nghiệp hay một cột mốc đáng nhớ.','Hoa vàng theo mùa, hồng, lá phụ',None),
 ('hen-mua-yeu','Hẹn mùa yêu','Hoa cưới','Ngày cưới',1450000,None,'pink','Gam hồng lãng mạn và dải ruy băng mềm, hoàn thiện khoảnh khắc bước bên nhau.','Hồng pastel, hoa theo mùa, ruy băng',None),
 ('mot-chut-thuong','Một chút thương','Bó hoa','Sinh nhật',350000,None,'tulip','Nhỏ xinh nhưng đầy tình cảm. Một món quà tự nhiên cho ngày bình thường trở nên đặc biệt.','Tulip theo mùa, hoa phụ','Nhỏ xinh'),
]
catalog = []
keys = ['slug','name','category','occasion','price','old_price','image','description','flowers','badge']
for index, row in enumerate(products, start=1):
 values = list(row)
 values[6] = '/images/' + values[6] + '.jpg'
 catalog.append(dict(zip(keys, values), id=index, stock=20, active=True))
(ROOT/'database/seed.json').write_text(json.dumps(catalog, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')

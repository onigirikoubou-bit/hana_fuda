const cards = [
    // 1月：松（光、赤短、カス2）
    {"id": "matsu_hikari", "name": "松に鶴", "rank": "大吉", "col": 0, "row": 0},
    {"id": "matsu_tan", "name": "松に赤短", "rank": "大吉", "col": 0, "row": 1},
    {"id": "matsu_kasu1", "name": "松のカス", "rank": "末吉", "col": 0, "row": 2},
    {"id": "matsu_kasu2", "name": "松のカス", "rank": "末吉", "col": 0, "row": 3},
    
    // 2月：梅（種、赤短、カス2）※光なし
    {"id": "ume_tane", "name": "梅に鶯", "rank": "吉", "col": 1, "row": 0},
    {"id": "ume_tan", "name": "梅に赤短", "rank": "大吉", "col": 1, "row": 1},
    {"id": "ume_kasu1", "name": "梅のカス", "rank": "末吉", "col": 1, "row": 2},
    {"id": "ume_kasu2", "name": "梅のカス", "rank": "末吉", "col": 1, "row": 3},
    
    // 3月：桜（光、赤短、カス2）
    {"id": "sakura_hikari", "name": "桜に幕", "rank": "大吉", "col": 2, "row": 0},
    {"id": "sakura_tan", "name": "桜に赤短", "rank": "大吉", "col": 2, "row": 1},
    {"id": "sakura_kasu1", "name": "桜のカス", "rank": "末吉", "col": 2, "row": 2},
    {"id": "sakura_kasu2", "name": "桜のカス", "rank": "末吉", "col": 2, "row": 3},
    
    // 4月：藤（種、短冊、カス2）
    {"id": "fuji_tane", "name": "藤に時鳥", "rank": "吉", "col": 3, "row": 0},
    {"id": "fuji_tan", "name": "藤に短冊", "rank": "吉", "col": 3, "row": 1},
    {"id": "fuji_kasu1", "name": "藤のカス", "rank": "末吉", "col": 3, "row": 2},
    {"id": "fuji_kasu2", "name": "藤のカス", "rank": "末吉", "col": 3, "row": 3},
    
    // 5月：菖蒲（種、短冊、カス2）
    {"id": "ayame_tane", "name": "菖蒲に八つ橋", "rank": "吉", "col": 4, "row": 0},
    {"id": "ayame_tan", "name": "菖蒲に短冊", "rank": "吉", "col": 4, "row": 1},
    {"id": "ayame_kasu1", "name": "菖蒲のカス", "rank": "末吉", "col": 4, "row": 2},
    {"id": "ayame_kasu2", "name": "菖蒲のカス", "rank": "末吉", "col": 4, "row": 3},
    
    // 6月：牡丹（種、青短、カス2）
    {"id": "botan_tane", "name": "牡丹に蝶", "rank": "吉", "col": 5, "row": 0},
    {"id": "botan_tan", "name": "牡丹に青短", "rank": "大吉", "col": 5, "row": 1},
    {"id": "botan_kasu1", "name": "牡丹のカス", "rank": "末吉", "col": 5, "row": 2},
    {"id": "botan_kasu2", "name": "牡丹のカス", "rank": "末吉", "col": 5, "row": 3},
    
    // 7月：萩（種、青短、カス2）
    {"id": "hagi_tane", "name": "萩に猪", "rank": "吉", "col": 6, "row": 0},
    {"id": "hagi_tan", "name": "萩に青短", "rank": "大吉", "col": 6, "row": 1},
    {"id": "hagi_kasu1", "name": "萩のカス", "rank": "末吉", "col": 6, "row": 2},
    {"id": "hagi_kasu2", "name": "萩のカス", "rank": "末吉", "col": 6, "row": 3},
    
    // 8月：芒（光、種、カス2）
    {"id": "susuki_hikari", "name": "芒に月", "rank": "大吉", "col": 7, "row": 0},
    {"id": "susuki_tane", "name": "芒に雁", "rank": "吉", "col": 7, "row": 1},
    {"id": "susuki_kasu1", "name": "芒のカス", "rank": "末吉", "col": 7, "row": 2},
    {"id": "susuki_kasu2", "name": "芒のカス", "rank": "末吉", "col": 7, "row": 3},
    
    // 9月：菊（種、青短、カス2）
    {"id": "kiku_tane", "name": "菊に盃", "rank": "吉", "col": 8, "row": 0},
    {"id": "kiku_tan", "name": "菊に青短", "rank": "大吉", "col": 8, "row": 1},
    {"id": "kiku_kasu1", "name": "菊のカス", "rank": "末吉", "col": 8, "row": 2},
    {"id": "kiku_kasu2", "name": "菊のカス", "rank": "末吉", "col": 8, "row": 3},
    
    // 10月：紅葉（種、青短、カス2）
    {"id": "momiji_tane", "name": "紅葉に鹿", "rank": "吉", "col": 9, "row": 0},
    {"id": "momiji_tan", "name": "紅葉に青短", "rank": "大吉", "col": 9, "row": 1},
    {"id": "momiji_kasu1", "name": "紅葉のカス", "rank": "末吉", "col": 9, "row": 2},
    {"id": "momiji_kasu2", "name": "紅葉のカス", "rank": "末吉", "col": 9, "row": 3},
    
    // 11月：柳（光、種、赤短、カス）※柳の短冊は赤短扱い
    {"id": "yanagi_hikari", "name": "柳に道風", "rank": "吉", "col": 10, "row": 0},
    {"id": "yanagi_tane", "name": "柳に燕", "rank": "吉", "col": 10, "row": 1},
    {"id": "yanagi_tan", "name": "柳に赤短", "rank": "大吉", "col": 10, "row": 2},
    {"id": "yanagi_kasu", "name": "柳に雷様", "rank": "凶", "col": 10, "row": 3},
    
    // 12月：桐（光、カス3）
    {"id": "kiri_hikari", "name": "桐に鳳凰", "rank": "大吉", "col": 11, "row": 0},
    {"id": "kiri_kasu1", "name": "桐のカス", "rank": "吉", "col": 11, "row": 1},
    {"id": "kiri_kasu2", "name": "桐のカス", "rank": "吉", "col": 11, "row": 2},
    {"id": "kiri_kasu3", "name": "桐のカス", "rank": "吉", "col": 11, "row": 3}
];
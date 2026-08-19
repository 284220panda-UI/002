const state = {
  mode: "linear",
  lineIndex: 0,
  evidence: new Set(),
  clues: [],
  log: [],
  viewedZhouLifeWeek: false,
  viewedLinLifeWeek: false,
  knownE010: false,
  knownE011: false,
  knownE012: false,
  completedCampingSetup: false,
  completedNewHomeSetup: false,
  completedNewCityMap: false,
  zhouLifeDetailChoice: "none",
  linLifeDetailChoice: "none",
  lifeCostPreference: "none",
  chapterComplete: false,
};

const sceneCard = document.querySelector("#sceneCard");
const speaker = document.querySelector("#speaker");
const nodeLabel = document.querySelector("#node");
const dialogueText = document.querySelector("#dialogueText");
const dialoguePanel = document.querySelector(".dialogue-panel");
const questionGrid = document.querySelector("#questionGrid");
const questionHint = document.querySelector("#questionHint");
const choiceStack = document.querySelector(".choice-stack");
const chapterGoal = document.querySelector("#chapterGoal");
const lifeBoard = document.querySelector("#lifeBoard");
const reviewCard = document.querySelector("#reviewCard");
const zhouLifeStatus = document.querySelector("#zhouLifeStatus");
const linLifeStatus = document.querySelector("#linLifeStatus");
const miniGame = document.querySelector("#miniGame");
const miniBoardImage = document.querySelector("#miniBoardImage");
const miniZones = document.querySelector("#miniZones");
const miniTray = document.querySelector("#miniTray");
const miniComplete = document.querySelector("#miniComplete");
const evidenceModal = document.querySelector("#evidenceModal");
const phoneModal = document.querySelector("#phoneModal");
const logModal = document.querySelector("#logModal");
const itemModal = document.querySelector("#itemModal");
const itemImage = document.querySelector("#itemImage");
const itemTitle = document.querySelector("#itemTitle");
const itemDesc = document.querySelector("#itemDesc");
const evidenceCount = document.querySelector("#evidenceCount");
const evidenceEmpty = document.querySelector("#evidenceEmpty");
const clueList = document.querySelector("#clueList");
const logList = document.querySelector("#logList");
const logCount = document.querySelector("#logCount");
const logEmpty = document.querySelector("#logEmpty");
const zhouPanel = document.querySelector("#zhouPanel");
const linPanel = document.querySelector("#linPanel");

if (sceneCard && choiceStack && choiceStack.parentElement !== sceneCard) {
  sceneCard.appendChild(choiceStack);
}

let currentLines = [];
let afterLinear = null;
let afterItemClose = null;
let activeInteraction = null;
let selectedMiniItem = null;
let miniPromptDismissed = false;
let dragState = null;
let suppressMiniClick = false;

const standeeAssets = {
  zhou: {
    neutral: "./assets/characters/v1_full/zhou_base.png",
    frown: "./assets/characters/v1_full/zhou_base.png",
    embarrassed: "./assets/characters/v1_full/zhou_base.png",
  },
  lin: {
    neutral: "./assets/characters/v1_full/lin_base.png",
    teasing: "./assets/characters/v1_full/lin_base.png",
    serious: "./assets/characters/v1_full/lin_base.png",
    offended: "./assets/characters/v1_full/lin_base.png",
  },
};

const evidenceItems = {
  old: {
    title: "E010 老城生活一周记录",
    desc: "老城不是只有重复，但重复也不会消失。",
    image: "./assets/chapter4/camping_complete_v5.webp",
  },
  new: {
    title: "E011 新城试住一周记录",
    desc: "我在哪里哪里就是家。但家不是自动出现的。",
    image: "./assets/chapter4/map_complete.webp",
  },
  missing: {
    title: "E012 两种生活的缺页",
    desc: "两份生活记录都很完整。但每一份都少了最难熬的几页。",
    image: "./assets/chapter4/home_complete_v12_from_final_cg.webp",
  },
};

const miniConfigs = {
  camping: {
    goal: "露营物品摆放",
    board: "./assets/chapter4/camping_board_v5.webp",
    complete: "./assets/chapter4/camping_complete_v5.webp",
    node: "ch04_003_camping_setup",
    prompt: "把露营物品拖到对应阴影处，让这次露营真的成形。",
    layeredReveal: true,
    layerOrder: ["tent", "mat", "boardgame", "food"],
    requiredCount: 4,
    items: [
      { id: "tent", label: "帐篷", asset: "./assets/chapter4/items/tent_sticker.png", zone: "tent" },
      { id: "mat", label: "野餐垫", asset: "./assets/chapter4/items/mat_sticker.png", zone: "mat" },
      { id: "boardgame", label: "桌游", asset: "./assets/chapter4/items/boardgame_sticker.png", zone: "boardgame" },
      { id: "food", label: "食物", asset: "./assets/chapter4/items/food_sticker.png", zone: "food" },
    ],
    zones: [
      {
        id: "tent",
        label: "支在草地后侧",
        left: 44.92,
        top: 12.08,
        width: 55.08,
        height: 33.33,
        hintLayer: "./assets/chapter4/hints/tent_hint.png",
        revealLayer: "./assets/chapter4/reveals/tent_reveal.png",
      },
      {
        id: "mat",
        label: "铺在草地前侧",
        left: 0,
        top: 37.08,
        width: 100,
        height: 50.63,
        hintLayer: "./assets/chapter4/hints/mat_hint.png",
        revealLayer: "./assets/chapter4/reveals/mat_reveal.png",
      },
      {
        id: "boardgame",
        label: "放在垫子左侧",
        left: 9.38,
        top: 50.63,
        width: 43.49,
        height: 24.48,
        hintLayer: "./assets/chapter4/hints/boardgame_hint.png",
        revealLayer: "./assets/chapter4/reveals/boardgame_reveal.png",
      },
      {
        id: "food",
        label: "放在垫子右侧",
        left: 53.39,
        top: 44.79,
        width: 46.61,
        height: 36.56,
        hintLayer: "./assets/chapter4/hints/food_hint.png",
        revealLayer: "./assets/chapter4/reveals/food_reveal.png",
      },
    ],
    completeText: "露营地收拾好了。",
  },
  home: {
    goal: "新城小公寓布置",
    board: "./assets/chapter4/home_board_v12_from_final_cg.png",
    complete: "./assets/chapter4/home_complete_v12_from_final_cg.webp",
    node: "ch04_006_new_home_setup",
    prompt: "把贴纸拖到对应阴影处，让空房间一点点变成能住的家。",
    layeredReveal: true,
    layerOrder: ["fridge_notes", "bookcase_life_corner", "controller_pair", "dinner_pair"],
    items: [
      { id: "fridge_notes", label: "冰箱便签", asset: "./assets/chapter4/items/home_fridge_notes_v11_retry2.png", zone: "fridge_notes" },
      { id: "bookcase_life_corner", label: "生活角", asset: "./assets/chapter4/items/home_bookcase_life_corner_v11_retry2.png", zone: "bookcase_life_corner" },
      { id: "controller_pair", label: "双人手柄", asset: "./assets/chapter4/items/home_controller_pair_v11_retry2.png", zone: "controller_pair" },
      { id: "dinner_pair", label: "外卖袋", asset: "./assets/chapter4/items/home_takeout_bag_v11_retry2.png", zone: "dinner_pair" },
    ],
    zones: [
      {
        id: "fridge_notes",
        label: "贴到冰箱上门",
        left: 8.46,
        top: 11.46,
        width: 27.34,
        height: 23.96,
        hintLayer: "./assets/chapter4/hints/home_fridge_notes_hint_v12_from_final_cg.png",
        revealLayer: "./assets/chapter4/reveals/home_fridge_notes_reveal_v12_masked.png",
      },
      {
        id: "bookcase_life_corner",
        label: "放到书柜生活角",
        left: 37.11,
        top: 31.25,
        width: 35.16,
        height: 29.69,
        hintLayer: "./assets/chapter4/hints/home_bookcase_life_corner_hint_v12_from_final_cg.png",
        revealLayer: "./assets/chapter4/reveals/home_bookcase_life_corner_reveal_v12_masked.png",
      },
      {
        id: "controller_pair",
        label: "放到茶几左侧",
        left: 29.3,
        top: 59.38,
        width: 28.65,
        height: 16.67,
        hintLayer: "./assets/chapter4/hints/home_controller_pair_hint_v12_from_final_cg.png",
        revealLayer: "./assets/chapter4/reveals/home_controller_pair_reveal_v12_masked.png",
      },
      {
        id: "dinner_pair",
        label: "放到茶几右侧",
        left: 53.39,
        top: 53.13,
        width: 42.32,
        height: 29.69,
        hintLayer: "./assets/chapter4/hints/home_dinner_pair_hint_v12_from_final_cg.png",
        revealLayer: "./assets/chapter4/reveals/home_dinner_pair_reveal_v12_masked.png",
      },
    ],
    completeText: "小公寓终于有了生活的痕迹。",
  },
  map: {
    goal: "新城生活地图标记",
    board: "./assets/chapter4/map_board.webp",
    complete: "./assets/chapter4/map_complete.webp",
    node: "ch04_008_new_city_map",
    prompt: "标出至少四个生活点，把陌生街区拆成能处理的小事。",
    items: [
      { id: "home", label: "小公寓地址", asset: "./assets/chapter4/items/map_home.png", zone: "home" },
      { id: "dinner", label: "能接受的晚饭", asset: "./assets/chapter4/items/map_dinner.png", zone: "dinner" },
      { id: "pharmacy", label: "常用药店", asset: "./assets/chapter4/items/map_pharmacy.png", zone: "pharmacy" },
      { id: "noise", label: "施工噪音点", asset: "./assets/chapter4/items/map_noise.png", zone: "noise" },
      { id: "route", label: "夜间回家路线", asset: "./assets/chapter4/items/map_route.png", zone: "route" },
    ],
    zones: [
      { id: "home", label: "住处定位", left: 44, top: 43, width: 18, height: 14 },
      { id: "dinner", label: "晚饭备选", left: 61, top: 38, width: 20, height: 14 },
      { id: "pharmacy", label: "药店路线", left: 28, top: 58, width: 18, height: 14 },
      { id: "noise", label: "避开的施工街", left: 56, top: 62, width: 22, height: 14 },
      { id: "route", label: "夜间回家线", left: 33, top: 36, width: 21, height: 14 },
    ],
    completeText: "新城临时生活地图完成。",
  },
};

const introLines = [
  { speaker: "404", node: "ch04_001_life_board_open", text: "第三章记录的感受没有消失。" },
  { speaker: "404", node: "ch04_001_life_board_open", text: "它像一张贴纸，被贴在推理板角落。" },
  ...buildLifeBoardEchoLines(),
];

function buildLifeBoardEchoLines() {
  const feeling =
    localStorage.getItem("project002_life_preference_feeling") ||
    localStorage.getItem("life_preference_feeling") ||
    "";
  const echo = {
    stay: "你曾经被“留下来的生活”打动。",
    leave: "你曾经被“出发后的生活”打动。",
    both: "你承认两种生活都像真的。",
    uneasy: "你开始害怕它们太像真的。",
  }[feeling];
  if (!echo) return [];
  return [{ speaker: "404", node: "ch04_001_life_board_open", text: echo }];
}

const zhouCampingIntro = [
  { speaker: "回忆", node: "ch04_003_zhou_weekend_camping", text: "朋友群的露营邀约真的成行了。", background: "chapter4-memory-zhou-camping" },
  { speaker: "回忆", node: "ch04_003_zhou_weekend_camping", text: "有人带炉子，有人忘了带打火机，有人一路吐槽导航。", background: "chapter4-memory-zhou-camping" },
  { speaker: "回忆", node: "ch04_003_zhou_weekend_camping", text: "周砚川没有抢着表现，只是把你随口说过的薄外套放进包里。", background: "chapter4-memory-zhou-camping" },
  { speaker: "朋友", node: "ch04_003_zhou_weekend_camping", text: "你们俩终于舍得从小区出来了。", background: "chapter4-memory-zhou-camping" },
  { speaker: "玩家", node: "ch04_003_zhou_weekend_camping", text: "这话听起来像我平时只在楼下便利店活动。", background: "chapter4-memory-zhou-camping" },
  { speaker: "朋友", node: "ch04_003_zhou_weekend_camping", text: "也差不多。你平时最远的远门就是楼下取快递。", background: "chapter4-memory-zhou-camping" },
  { speaker: "玩家", node: "ch04_003_zhou_weekend_camping", text: "不要在户外攻击我的活动半径。", background: "chapter4-memory-zhou-camping" },
  { speaker: "周砚川", character: "zhou", node: "ch04_003_zhou_weekend_camping", text: "她这次是真的想来。", background: "chapter4-memory-zhou-camping" },
  { speaker: "玩家", node: "ch04_003_zhou_weekend_camping", text: "你怎么知道？", background: "chapter4-memory-zhou-camping" },
  { speaker: "周砚川", character: "zhou", node: "ch04_003_zhou_weekend_camping", text: "她今天把防潮垫、湿巾和充电宝都带了。", background: "chapter4-memory-zhou-camping" },
  { speaker: "朋友", node: "ch04_003_zhou_weekend_camping", text: "这已经是认真过日子的程度了。", background: "chapter4-memory-zhou-camping" },
  { speaker: "玩家", node: "ch04_003_zhou_weekend_camping", text: "我只是怕来了以后什么都不会。", background: "chapter4-memory-zhou-camping" },
  { speaker: "周砚川", character: "zhou", node: "ch04_003_zhou_weekend_camping", text: "不会也没关系。有人会生火，有人会搭帐篷，你也带了很多。", background: "chapter4-memory-zhou-camping" },
  { speaker: "404", node: "ch04_003_camping_setup", text: "轻互动：把露营物品放到合适位置。" },
];

const zhouCampingChoices = [
  { label: "帮朋友铺野餐垫", action: "camp_help_picnic_mat" },
  { label: "偷偷拍一张朋友们围在一起的照片", action: "camp_sneak_photo" },
];

const zhouCampingFeedback = {
  help_picnic_mat: [
    { speaker: "回忆", node: "ch04_003_zhou_weekend_camping", text: "你和朋友把野餐垫压在草地上，风一吹又翘起来。", background: "chapter4-memory-zhou-camping" },
    { speaker: "回忆", node: "ch04_003_zhou_weekend_camping", text: "周砚川把营地灯放在垫角，刚好压住。", background: "chapter4-memory-zhou-camping" },
    { speaker: "朋友", node: "ch04_003_zhou_weekend_camping", text: "可以啊，你们俩有点默契。", background: "chapter4-memory-zhou-camping" },
  ],
  sneak_photo: [
    { speaker: "回忆", node: "ch04_003_zhou_weekend_camping", text: "你举起手机，拍到朋友们围着炉子争论先烤什么。", background: "chapter4-memory-zhou-camping" },
    { speaker: "回忆", node: "ch04_003_zhou_weekend_camping", text: "周砚川没有看镜头，只伸手替你挡了一下风。", background: "chapter4-memory-zhou-camping" },
    { speaker: "回忆", node: "ch04_003_zhou_weekend_camping", text: "照片有点糊，但每个人都在笑。", background: "chapter4-memory-zhou-camping" },
  ],
};

const zhouCatIntro = [
  { speaker: "回忆", node: "ch04_004_zhou_stray_cat", text: "画面一转，又到了傍晚，是你家楼下。", background: "chapter4-memory-zhou-cat" },
  { speaker: "回忆", node: "ch04_004_zhou_stray_cat", text: "你们晚上出门散步，回家时听见楼下花坛里传来很细的叫声。", background: "chapter4-memory-zhou-cat" },
  { speaker: "回忆", node: "ch04_004_zhou_stray_cat", text: "一只灰白色的小猫缩在纸箱后面，耳朵尖湿了一点。", background: "chapter4-memory-zhou-cat" },
  { speaker: "玩家", node: "ch04_004_zhou_stray_cat", text: "它怎么在这？", background: "chapter4-memory-zhou-cat" },
  { speaker: "周砚川", character: "zhou", node: "ch04_004_zhou_stray_cat", text: "可能被人临时放在这。还是被人……？", background: "chapter4-memory-zhou-cat" },
  { speaker: "玩家", node: "ch04_004_zhou_stray_cat", text: "你有些紧张哦。", background: "chapter4-memory-zhou-cat" },
  { speaker: "周砚川", character: "zhou", node: "ch04_004_zhou_stray_cat", text: "面对生命还是需要重视的。", background: "chapter4-memory-zhou-cat" },
  { speaker: "回忆", node: "ch04_004_zhou_stray_cat", text: "周砚川蹲下来，把外套脱下来小心翼翼包住猫，放在箱子里。", background: "chapter4-memory-zhou-cat" },
  { speaker: "回忆", node: "ch04_004_zhou_stray_cat", text: "他抬头看你，声音比刚才轻了一点。", background: "chapter4-memory-zhou-cat" },
  { speaker: "周砚川", character: "zhou", node: "ch04_004_zhou_stray_cat", text: "我们先处理一下？", background: "chapter4-memory-zhou-cat" },
];

const zhouCatFeedback = {
  vet: [
    { speaker: "回忆", node: "ch04_004_zhou_stray_cat", text: "周砚川立刻查附近还开着的宠物医院。", background: "chapter4-memory-zhou-cat" },
    { speaker: "回忆", node: "ch04_004_zhou_stray_cat", text: "玩家抱着纸箱坐在后座，小猫在里面很小声地叫。", background: "chapter4-memory-zhou-cat" },
    { speaker: "周砚川", character: "zhou", node: "ch04_004_zhou_stray_cat", text: "先确认它有没有受伤，其他事回头再想。", background: "chapter4-memory-zhou-cat" },
    { speaker: "404", node: "ch04_004_zhou_stray_cat", text: "记录：你先选择确认小猫安全。" },
  ],
  group: [
    { speaker: "回忆", node: "ch04_004_zhou_stray_cat", text: "你在业主群发了照片，很快有人问猫在哪里。", background: "chapter4-memory-zhou-cat" },
    { speaker: "回忆", node: "ch04_004_zhou_stray_cat", text: "周砚川没有急着把猫交出去，只让对方描述特征。", background: "chapter4-memory-zhou-cat" },
    { speaker: "周砚川", character: "zhou", node: "ch04_004_zhou_stray_cat", text: "喜欢它是一回事，确认它该去哪是另一回事。", background: "chapter4-memory-zhou-cat" },
    { speaker: "404", node: "ch04_004_zhou_stray_cat", text: "记录：你先确认它该去哪。" },
  ],
  care: [
    { speaker: "回忆", node: "ch04_004_zhou_stray_cat", text: "你们买了猫粮、纸箱和一条旧毛巾。", background: "chapter4-memory-zhou-cat" },
    { speaker: "回忆", node: "ch04_004_zhou_stray_cat", text: "小猫吃得很急，吃完又缩回角落。", background: "chapter4-memory-zhou-cat" },
    { speaker: "玩家", node: "ch04_004_zhou_stray_cat", text: "它好像不太相信我们。", background: "chapter4-memory-zhou-cat" },
    { speaker: "周砚川", character: "zhou", node: "ch04_004_zhou_stray_cat", text: "正常。信任也不是喂一次饭就有。", background: "chapter4-memory-zhou-cat" },
    { speaker: "404", node: "ch04_004_zhou_stray_cat", text: "记录：你先照顾一晚。" },
  ],
};

const zhouCatFollowUp = [
  { speaker: "玩家", node: "ch04_004_zhou_stray_cat", text: "如果真的没人要呢？", background: "chapter4-memory-zhou-cat" },
  { speaker: "周砚川", character: "zhou", node: "ch04_004_zhou_stray_cat", text: "那就认真算一下。", background: "chapter4-memory-zhou-cat" },
  { speaker: "玩家", node: "ch04_004_zhou_stray_cat", text: "算什么？", background: "chapter4-memory-zhou-cat" },
  { speaker: "周砚川", character: "zhou", node: "ch04_004_zhou_stray_cat", text: "时间、钱、房东同不同意，还有我们是不是真的想养。", background: "chapter4-memory-zhou-cat" },
  { speaker: "玩家", node: "ch04_004_zhou_stray_cat", text: "你不觉得这种时候应该冲动一点？", background: "chapter4-memory-zhou-cat" },
  { speaker: "周砚川", character: "zhou", node: "ch04_004_zhou_stray_cat", text: "我可以冲动地喜欢它，但不能冲动负责。", background: "chapter4-memory-zhou-cat" },
];

const zhouCostIntro = [
  { speaker: "回忆", node: "ch04_005_zhou_repetition_cost", text: "周一早上，闹钟响了很久。" },
  { speaker: "回忆", node: "ch04_005_zhou_repetition_cost", text: "地铁站还是一样的人流，早餐店还是排队，消息列表里还是工作。" },
  { speaker: "回忆", node: "ch04_005_zhou_repetition_cost", text: "露营照片和小猫照片都在相册里，但你还是站在同一条通勤线上。" },
  { speaker: "玩家", node: "ch04_005_zhou_repetition_cost", text: "我以为生活变好了，就不会这么烦。" },
  { speaker: "周砚川", character: "zhou", node: "ch04_005_zhou_repetition_cost", text: "不会。" },
  { speaker: "玩家", node: "ch04_005_zhou_repetition_cost", text: "你倒是很诚实。" },
  { speaker: "周砚川", character: "zhou", node: "ch04_005_zhou_repetition_cost", text: "变好不是变成另一种人生。" },
  { speaker: "周砚川", character: "zhou", node: "ch04_005_zhou_repetition_cost", text: "它只是让你在同一种人生里，多一点能喘气的地方。" },
  { speaker: "玩家", node: "ch04_005_zhou_repetition_cost", text: "那如果我还是受不了重复呢？" },
  { speaker: "周砚川", character: "zhou", node: "ch04_005_zhou_repetition_cost", text: "那就承认受不了。" },
  { speaker: "周砚川", character: "zhou", node: "ch04_005_zhou_repetition_cost", text: "我们可以继续改。" },
  { speaker: "周砚川", character: "zhou", node: "ch04_005_zhou_repetition_cost", text: "改不了，也可以走。" },
];

const zhouCostFeedback = {
  accept: [
    { speaker: "404", node: "ch04_005_zhou_repetition_cost", text: "界面记录：当前可以接受老城的重复，但需要持续改造。" },
    { speaker: "周砚川", character: "zhou", node: "ch04_005_zhou_repetition_cost", text: "那我们就继续把重复的地方改小一点。" },
  ],
  fear: [
    { speaker: "404", node: "ch04_005_zhou_repetition_cost", text: "界面记录：当前仍然害怕老城重复感。" },
    { speaker: "周砚川", character: "zhou", expression: "frown", node: "ch04_005_zhou_repetition_cost", text: "害怕不代表你选错。只是它确实存在。" },
  ],
  unsure: [
    { speaker: "404", node: "ch04_005_zhou_repetition_cost", text: "界面记录：当前对安稳也感到难过。" },
    { speaker: "周砚川", character: "zhou", node: "ch04_005_zhou_repetition_cost", text: "安稳不是所有人的答案，也不是每一天都能救人。" },
  ],
};

const linHomeIntro = [
  { speaker: "回忆", node: "ch04_006_lin_home_setup", text: "新城小公寓比照片里小一点，窗帘有折痕，地板角落还有一点灰。" },
  { speaker: "回忆", node: "ch04_006_lin_home_setup", text: "林夏把行李箱往墙边一推，拍了拍手。" },
  { speaker: "林夏", character: "lin", expression: "teasing", node: "ch04_006_lin_home_setup", text: "好了，宣布这里暂时归我们管。" },
  { speaker: "玩家", node: "ch04_006_lin_home_setup", text: "你是不是太快进入状态了？" },
  { speaker: "林夏", character: "lin", expression: "serious", node: "ch04_006_lin_home_setup", text: "我在哪里，哪里就是家。" },
  { speaker: "玩家", node: "ch04_006_lin_home_setup", text: "家里还是收拾一下吧。" },
  { speaker: "林夏", character: "lin", node: "ch04_006_lin_home_setup", text: "有道理。家可以乱，但不能脏。你先休息一下，我先来大展身手收拾一下。" },
  { speaker: "回忆", node: "ch04_006_lin_home_setup", text: "你们去楼下小店买了小夜灯、冰箱贴、地垫、便宜餐具和一卷很难撕开的垃圾袋。" },
  { speaker: "回忆", node: "ch04_006_lin_home_setup", text: "林夏认真把冰箱贴贴歪，又认真说：“有点灵魂了。”" },
  { speaker: "404", node: "ch04_006_new_home_setup", text: "轻互动：把生活小物放进新城小公寓。" },
];

/* REMOVED: linHomeChoices — user asked to delete the "kitchen/mat_light/balcony" choice */
/*
const linHomeChoices = [
  { label: "先收拾厨房", action: "home_kitchen" },
  { label: "先铺地垫和小夜灯", action: "home_mat_light" },
  { label: "先整理阳台", action: "home_balcony" },
];
*/

const linHomeFeedback = {
  kitchen: [
    { speaker: "回忆", node: "ch04_006_lin_home_setup", text: "你把便宜餐具拆出来，发现碗底贴纸撕不干净。" },
    { speaker: "回忆", node: "ch04_006_lin_home_setup", text: "林夏蹲在旁边研究半天，最后认真宣布：“这只碗有新城户口了。”" },
    { speaker: "回忆", node: "ch04_006_lin_home_setup", text: "厨房还是很小，但水槽边多了一块擦干净的地方。" },
  ],
  mat_light: [
    { speaker: "回忆", node: "ch04_006_lin_home_setup", text: "地垫铺了两次才摆正，小夜灯插上电以后，把墙角照出一小圈暖光。" },
    { speaker: "回忆", node: "ch04_006_lin_home_setup", text: "林夏把冰箱贴贴在灯旁边，说这样晚上找开关比较有仪式感。" },
    { speaker: "玩家", node: "ch04_006_lin_home_setup", text: "你对仪式感的定义很灵活。" },
    { speaker: "林夏", character: "lin", node: "ch04_006_lin_home_setup", text: "能用就行。" },
  ],
  balcony: [
    { speaker: "回忆", node: "ch04_006_lin_home_setup", text: "阳台门推开时有一点卡，你们一起把纸箱挪到墙边。" },
    { speaker: "回忆", node: "ch04_006_lin_home_setup", text: "风吹进来，窗帘皱巴巴地贴到林夏手臂上。" },
    { speaker: "林夏", character: "lin", expression: "teasing", node: "ch04_006_lin_home_setup", text: "看，阳台正式上线。" },
    { speaker: "玩家", node: "ch04_006_lin_home_setup", text: "它刚才只是灰尘收纳区。" },
    { speaker: "林夏", character: "lin", node: "ch04_006_lin_home_setup", text: "现在是未来早餐区。" },
  ],
};

const linHomeAfter = [
  { speaker: "回忆", node: "ch04_006_lin_home_setup", text: "房间终于像能住人。", background: "chapter4-memory-lin-home" },
  { speaker: "回忆", node: "ch04_006_lin_home_setup", text: "为了庆祝收拾好，你们点了外卖，坐在地上，开开心心打游戏。", background: "chapter4-memory-lin-home" },
  { speaker: "林夏", character: "lin", node: "ch04_006_lin_home_setup", text: "赢的人不用收拾外卖盒。", background: "chapter4-memory-lin-home" },
  { speaker: "玩家", node: "ch04_006_lin_home_setup", text: "那你刚才说这里是家。", background: "chapter4-memory-lin-home" },
  { speaker: "林夏", character: "lin", node: "ch04_006_lin_home_setup", text: "家也需要公平竞争。", background: "chapter4-memory-lin-home" },
];

const linBeachIntro = [
  { speaker: "回忆", node: "ch04_007_lin_beach_icecream_photo", text: "周末，林夏拉你去海边。", background: "chapter4-memory-lin-beach" },
  { speaker: "回忆", node: "ch04_007_lin_beach_icecream_photo", text: "她说只是看看海，结果鞋子第一个被她踢到沙滩边。", background: "chapter4-memory-lin-beach" },
  { speaker: "林夏", character: "lin", expression: "teasing", node: "ch04_007_lin_beach_icecream_photo", text: "来都来了，不玩水很浪费。", background: "chapter4-memory-lin-beach" },
  { speaker: "玩家", node: "ch04_007_lin_beach_icecream_photo", text: "你这个人对“计划”两个字是不是有误解？", background: "chapter4-memory-lin-beach" },
  { speaker: "林夏", character: "lin", node: "ch04_007_lin_beach_icecream_photo", text: "计划就是为了让意外有地方发生。", background: "chapter4-memory-lin-beach" },
  { speaker: "回忆", node: "ch04_007_lin_beach_icecream_photo", text: "你们买了冰淇淋，沿着海边走。", background: "chapter4-memory-lin-beach" },
  { speaker: "回忆", node: "ch04_007_lin_beach_icecream_photo", text: "林夏把相机塞给你。", background: "chapter4-memory-lin-beach" },
  { speaker: "玩家", node: "ch04_007_lin_beach_icecream_photo", text: "你让我拍？", background: "chapter4-memory-lin-beach" },
  { speaker: "林夏", character: "lin", node: "ch04_007_lin_beach_icecream_photo", text: "对。", background: "chapter4-memory-lin-beach" },
  { speaker: "玩家", node: "ch04_007_lin_beach_icecream_photo", text: "你不是摄影师吗？", background: "chapter4-memory-lin-beach" },
  { speaker: "林夏", character: "lin", expression: "serious", node: "ch04_007_lin_beach_icecream_photo", text: "摄影师也需要被拍一下，证明我不是新城本地刷新出来的 NPC。", background: "chapter4-memory-lin-beach" },
  { speaker: "回忆", node: "ch04_007_lin_beach_icecream_photo", text: "她踩进浅水里，回头冲你笑。", background: "chapter4-memory-lin-beach" },
  { speaker: "回忆", node: "ch04_007_lin_beach_icecream_photo", text: "冰淇淋快要化到手指上，你按下快门。", background: "chapter4-memory-lin-beach" },
];

const linBeachFeedback = {
  water: [
    { speaker: "回忆", node: "ch04_007_lin_beach_icecream_photo", text: "她回头时，海水刚好没过脚踝。", background: "chapter4-memory-lin-beach" },
    { speaker: "回忆", node: "ch04_007_lin_beach_icecream_photo", text: "照片里她笑得很亮，远处的人群和海风都被压成柔软的背景。", background: "chapter4-memory-lin-beach" },
    { speaker: "回忆", node: "ch04_007_lin_beach_icecream_photo", text: "林夏凑过来看，安静了一秒。", background: "chapter4-memory-lin-beach" },
    { speaker: "林夏", character: "lin", expression: "teasing", node: "ch04_007_lin_beach_icecream_photo", text: "可以啊，你有点会。", background: "chapter4-memory-lin-beach" },
  ],
  icecream: [
    { speaker: "回忆", node: "ch04_007_lin_beach_icecream_photo", text: "冰淇淋已经化到手指上，她还坚持把它举高一点。", background: "chapter4-memory-lin-beach" },
    { speaker: "回忆", node: "ch04_007_lin_beach_icecream_photo", text: "你按下快门时，她正皱着脸躲开滴下来的奶油。", background: "chapter4-memory-lin-beach" },
    { speaker: "回忆", node: "ch04_007_lin_beach_icecream_photo", text: "林夏第一次有些尴尬地想偷偷按删除。", background: "chapter4-memory-lin-beach" },
    { speaker: "玩家", node: "ch04_007_lin_beach_icecream_photo", text: "这张不许删。", background: "chapter4-memory-lin-beach" },
    { speaker: "林夏", character: "lin", node: "ch04_007_lin_beach_icecream_photo", text: "你确定？", background: "chapter4-memory-lin-beach" },
    { speaker: "玩家", node: "ch04_007_lin_beach_icecream_photo", text: "要支持新手摄影师，这很像你。", background: "chapter4-memory-lin-beach" },
  ],
  blur: [
    { speaker: "回忆", node: "ch04_007_lin_beach_icecream_photo", text: "她踩到一小块湿沙，身体歪了一下，照片糊得很彻底。", background: "chapter4-memory-lin-beach" },
    { speaker: "回忆", node: "ch04_007_lin_beach_icecream_photo", text: "林夏抢过来看，先沉默两秒，然后笑出声。", background: "chapter4-memory-lin-beach" },
    { speaker: "林夏", character: "lin", expression: "teasing", node: "ch04_007_lin_beach_icecream_photo", text: "很好，摄影师的尊严今日暂停营业。", background: "chapter4-memory-lin-beach" },
    { speaker: "玩家", node: "ch04_007_lin_beach_icecream_photo", text: "你不是说拍糊也行？", background: "chapter4-memory-lin-beach" },
    { speaker: "林夏", character: "lin", node: "ch04_007_lin_beach_icecream_photo", text: "我说的是你拍糊也行，不是我摔糊也行。", background: "chapter4-memory-lin-beach" },
  ],
};

const linMapIntro = [
  { speaker: "回忆", node: "ch04_008_lin_unfamiliar_cost", text: "林夏那天有拍摄，要到晚上才回来。" },
  { speaker: "回忆", node: "ch04_008_lin_unfamiliar_cost", text: "你一个人留在新城。" },
  { speaker: "回忆", node: "ch04_008_lin_unfamiliar_cost", text: "外卖送错了楼，你只能下楼随便买了一点晚饭，新城菜系的味道不太习惯，楼下施工声一直到傍晚。" },
  { speaker: "回忆", node: "ch04_008_lin_unfamiliar_cost", text: "这些都不是大事。" },
  { speaker: "回忆", node: "ch04_008_lin_unfamiliar_cost", text: "但在老城，它们甚至不会被你注意到。" },
  { speaker: "回忆", node: "ch04_008_lin_unfamiliar_cost", text: "你站在门口，突然意识到：新城不只是海边、冰淇淋和照片。" },
  { speaker: "回忆", node: "ch04_008_lin_unfamiliar_cost", text: "它也包括每一件都要重新认识的小事。" },
  { speaker: "回忆", node: "ch04_008_lin_unfamiliar_cost", text: "你没有慌，也没有等林夏回来处理。" },
  { speaker: "回忆", node: "ch04_008_lin_unfamiliar_cost", text: "你只是把手机地图、外卖地址、便利店小票和房间门牌号摆在桌上，开始给这个地方做第一版生活标记。" },
];

const linMapAfter = [
  { speaker: "回忆", node: "ch04_008_lin_unfamiliar_cost", text: "门口传来钥匙声。" },
  { speaker: "回忆", node: "ch04_008_lin_unfamiliar_cost", text: "林夏回来时，手里拎着一袋楼下小店买的热饮，袋子上还贴着新店开业的贴纸。" },
  { speaker: "林夏", character: "lin", node: "ch04_008_lin_unfamiliar_cost", text: "我回来了。今天一个人开荒怎么样？" },
  { speaker: "玩家", node: "ch04_008_lin_unfamiliar_cost", text: "外卖难吃，路也不认识。但我标了一张地图。" },
  { speaker: "回忆", node: "ch04_008_lin_unfamiliar_cost", text: "林夏把袋子放到桌边，凑过来看你画到一半的生活地图。" },
  { speaker: "林夏", character: "lin", node: "ch04_008_lin_unfamiliar_cost", text: "可以啊，已经有新手村地图了。" },
  { speaker: "玩家", node: "ch04_008_lin_unfamiliar_cost", text: "这个新手村体验不太友好。" },
  { speaker: "林夏", character: "lin", node: "ch04_008_lin_unfamiliar_cost", text: "那我们给它打差评，然后继续探索。" },
  { speaker: "玩家", node: "ch04_008_lin_unfamiliar_cost", text: "你这算安慰吗？" },
  { speaker: "林夏", character: "lin", node: "ch04_008_lin_unfamiliar_cost", text: "算鼓励。" },
  { speaker: "林夏", character: "lin", expression: "serious", node: "ch04_008_lin_unfamiliar_cost", text: "外卖难吃，不代表你不适合新城。" },
  { speaker: "林夏", character: "lin", node: "ch04_008_lin_unfamiliar_cost", text: "路不认识，也不代表这里不欢迎你。" },
  { speaker: "林夏", character: "lin", node: "ch04_008_lin_unfamiliar_cost", text: "只是它还没被我们用熟。" },
  { speaker: "玩家", node: "ch04_008_lin_unfamiliar_cost", text: "那要用多久？" },
  { speaker: "林夏", character: "lin", node: "ch04_008_lin_unfamiliar_cost", text: "不知道。可能要几顿难吃的饭，几条走错的路，还有几家意外好喝的店。" },
  { speaker: "玩家", node: "ch04_008_lin_unfamiliar_cost", text: "听起来成本很高。" },
  { speaker: "林夏", character: "lin", node: "ch04_008_lin_unfamiliar_cost", text: "但也很有趣。" },
  { speaker: "回忆", node: "ch04_008_lin_unfamiliar_cost", text: "林夏把新店贴纸撕下来，贴在地图空白处。" },
  { speaker: "林夏", character: "lin", node: "ch04_008_lin_unfamiliar_cost", text: "你看，今天至少新增一个待验证地点。" },
  { speaker: "玩家", node: "ch04_008_lin_unfamiliar_cost", text: "如果不好喝呢？" },
  { speaker: "林夏", character: "lin", node: "ch04_008_lin_unfamiliar_cost", text: "那就标成“下次避雷”。这也是熟悉。" },
  { speaker: "林夏", character: "lin", node: "ch04_008_lin_unfamiliar_cost", text: "我们可以一起把好吃的店、难走的路、晚上会吵的地方都标出来。" },
  { speaker: "林夏", character: "lin", expression: "serious", node: "ch04_008_lin_unfamiliar_cost", text: "家不是一句话说出来的，是我们这样一点一点认出来的。" },
];

const costReviewIntro = [
  { speaker: "404", node: "ch04_009_cost_review", text: "两种生活都不是奖励。" },
  { speaker: "404", node: "ch04_009_cost_review", text: "它们都有幸福，也都有必须忍耐的部分。" },
  { speaker: "404", node: "ch04_009_cost_review", text: "老城：朋友、社区、熟悉路线、稳定关系都在。但重复、无趣、旧压力也在。" },
  { speaker: "404", node: "ch04_009_cost_review", text: "新城：海边、新城小公寓、重新开始、林夏的活力都在。但陌生、食物不习惯、路线不熟、很多事要一个人处理也在。" },
  { speaker: "玩家", node: "ch04_009_cost_review", text: "所以现在要问的不是我更喜欢哪边。" },
  { speaker: "玩家", node: "ch04_009_cost_review", text: "是我更能接受哪一种生活的代价。" },
];

const costFeedback = {
  old_city: [
    { speaker: "404", node: "ch04_009_cost_review", text: "界面记录：当前更能接受老城生活的代价。" },
    { speaker: "周砚川", character: "zhou", node: "ch04_009_cost_review", text: "重复不是失败，但它确实需要耐心。" },
    { speaker: "林夏", character: "lin", node: "ch04_009_cost_review", text: "那我暂时输给小猫和露营。" },
  ],
  new_city: [
    { speaker: "404", node: "ch04_009_cost_review", text: "界面记录：当前更能接受新城生活的代价。" },
    { speaker: "林夏", character: "lin", expression: "serious", node: "ch04_009_cost_review", text: "陌生可以慢慢标地图。" },
    { speaker: "周砚川", character: "zhou", node: "ch04_009_cost_review", text: "不确定也需要耐心。" },
  ],
  neither: [
    { speaker: "404", node: "ch04_009_cost_review", text: "界面记录：当前还不能承受任何一种完整生活。" },
    { speaker: "周砚川", character: "zhou", node: "ch04_009_cost_review", text: "这也是答案。" },
    { speaker: "林夏", character: "lin", node: "ch04_009_cost_review", text: "至少不是随便选一个好看的。" },
  ],
  suspicious: [
    { speaker: "404", node: "ch04_009_cost_review", text: "界面记录：当前怀疑两种生活都被筛选过。" },
    { speaker: "周砚川", character: "zhou", expression: "frown", node: "ch04_009_cost_review", text: "太完整的生活，反而像被整理过。" },
  ],
};

const missingPagesLines = [
  { speaker: "404", node: "ch04_010_missing_pages", text: "已发现关键证据：两种生活的缺页。" },
  { speaker: "404", node: "ch04_010_missing_pages", text: "两份生活记录都很完整。" },
  { speaker: "404", node: "ch04_010_missing_pages", text: "但每一份都少了最难熬的几页。" },
  { speaker: "404", node: "ch04_010_missing_pages", text: "老城缺少：日复一日重复到麻木的日子。" },
  { speaker: "404", node: "ch04_010_missing_pages", text: "明明被爱着，却还是觉得生活没有变化的时刻。" },
  { speaker: "404", node: "ch04_010_missing_pages", text: "新城缺少：一个人迷路、吃不惯、联系不上熟人的时刻。" },
  { speaker: "404", node: "ch04_010_missing_pages", text: "明明很自由，却不知道自己是否真的落地的时刻。" },
  { speaker: "404", node: "ch04_010_missing_pages", text: "世界给我的不是答案，是最能动摇我的两个版本。" },
];

const chapterEndLines = [
  { speaker: "回忆", node: "ch04_011_chapter_end", text: "两份生活记录被并排放在桌上。" },
  { speaker: "回忆", node: "ch04_011_chapter_end", text: "它们都太真实了。" },
  { speaker: "回忆", node: "ch04_011_chapter_end", text: "真实到你开始舍不得。" },
  { speaker: "回忆", node: "ch04_011_chapter_end", text: "也真实到你开始怀疑。" },
  { speaker: "404", node: "chapter_04_complete", text: "Chapter 05 已解锁：最后选择。" },
];

document.querySelector(".topbar").addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const action = button.dataset.action;
  if (action === "phone") openPhone();
  if (action === "evidence") openEvidence();
  if (action === "log") openLog();
});

lifeBoard.addEventListener("click", (event) => {
  const button = event.target.closest("[data-life-action]");
  if (!button || button.classList.contains("locked")) return;
  recordChoice(button.dataset.lifeAction);
  if (button.dataset.lifeAction === "zhou") startZhouLife();
  if (button.dataset.lifeAction === "lin") startLinLife();
  if (button.dataset.lifeAction === "review") startCostReview();
});

miniTray.addEventListener("click", (event) => {
  if (suppressMiniClick) {
    event.preventDefault();
    suppressMiniClick = false;
    return;
  }
  const button = event.target.closest("[data-mini-item]");
  if (!button || button.disabled) return;
  dismissMiniPrompt();
  selectMiniItem(button);
});

miniTray.addEventListener("pointerdown", (event) => {
  const button = event.target.closest("[data-mini-item]");
  if (!button || button.disabled || !activeInteraction) return;
  startMiniDrag(event, button);
});

miniZones.addEventListener("click", (event) => {
  const zone = event.target.closest("[data-mini-zone]");
  if (!zone || !activeInteraction || !selectedMiniItem) return;
  dismissMiniPrompt();
  placeMiniItem(selectedMiniItem, zone.dataset.miniZone);
});

miniGame.addEventListener("click", () => {
  if (state.mode === "mini") dismissMiniPrompt();
});

miniComplete.addEventListener("click", () => {
  const callback = activeInteraction?.afterComplete;
  closeMiniGame();
  if (callback) callback();
});

questionGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button || button.disabled) return;
  const action = button.dataset.action;
  recordChoice(button.textContent);

  if (action.startsWith("camp_")) chooseCamping(action.replace("camp_", ""));
  // REMOVED: home_ choices deleted
  // if (action.startsWith("home_")) chooseHome(action.replace("home_", ""));
  if (action.startsWith("cat_")) chooseCat(action.replace("cat_", ""));
  if (action.startsWith("zhou_cost_")) chooseZhouCost(action.replace("zhou_cost_", ""));
  if (action.startsWith("beach_")) chooseBeach(action.replace("beach_", ""));
  if (action.startsWith("cost_")) chooseCost(action.replace("cost_", ""));
  if (action === "open_evidence") openEvidence();
  if (action === "restart_ch04") window.location.reload();
  if (action === "goto_ch5" && window.P002ChapterMenu) window.P002ChapterMenu.gotoNext();
});

document.querySelectorAll(".evidence-card").forEach((card) => {
  card.addEventListener("click", () => {
    if (!card.classList.contains("locked")) openEvidenceDetail(card.dataset.evidence);
  });
});

document.querySelector("#closeEvidence").addEventListener("click", closeEvidence);
document.querySelector("#closeLog").addEventListener("click", closeLog);
document.querySelector("#closeItem").addEventListener("click", closeItem);
document.querySelector("#closePhone").addEventListener("click", closePhone);
document.querySelector("[data-phone-action='board']").addEventListener("click", () => {
  closePhone();
  enterLifeBoard();
});

[evidenceModal, logModal, itemModal, phoneModal].forEach((modal) => {
  modal.addEventListener("click", (event) => {
    if (event.target !== modal) return;
    if (modal === evidenceModal) closeEvidence();
    if (modal === logModal) closeLog();
    if (modal === itemModal) closeItem();
    if (modal === phoneModal) closePhone();
  });
});

sceneCard.addEventListener("click", (event) => {
  if (state.mode === "miniComplete") {
    finishMiniGame();
    return;
  }
  if (state.mode === "mini") {
    if (!event.target.closest("[data-mini-item]")) dismissMiniPrompt();
    return;
  }
  if (
    event.target.closest("button") ||
    state.mode !== "linear" ||
    miniGame.classList.contains("active") ||
    itemModal.classList.contains("open") ||
    evidenceModal.classList.contains("open") ||
    logModal.classList.contains("open") ||
    phoneModal.classList.contains("open")
  ) {
    return;
  }
  advanceLine();
});

function startLinear(lines, onComplete) {
  state.mode = "linear";
  currentLines = lines;
  state.lineIndex = 0;
  afterLinear = onComplete;
  setButtons([], { showHint: true });
  renderCurrentLine();
}

function renderCurrentLine() {
  const line = currentLines[state.lineIndex];
  if (!line) {
    const callback = afterLinear;
    afterLinear = null;
    if (callback) callback();
    return;
  }
  if (line.background) setSceneMode(line.background);
  renderLine(line);
  if (line.done) line.done();
}

function advanceLine() {
  state.lineIndex += 1;
  renderCurrentLine();
}

function renderLine(line) {
  speaker.textContent = displaySpeakerName(line.speaker);
  dialoguePanel.classList.toggle("is-narration", !line.character && displaySpeakerName(line.speaker) === "叙述");
  nodeLabel.textContent = "";
  dialogueText.textContent = line.text;
  if (line.character) setActiveCharacter(line.character, line.expression);
  else setActiveCharacter(null);
  recordDialogueLine();
}

function displaySpeakerName(name) {
  if (name === "玩家") return "我";
  if (name === "回忆" || name === "404") return "叙述";
  return name;
}

function setActiveCharacter(character, expression = "neutral") {
  zhouPanel.classList.toggle("active", character === "zhou");
  linPanel.classList.toggle("active", character === "lin");
  if (character === "zhou") zhouPanel.src = standeeAssets.zhou[expression] || standeeAssets.zhou.neutral;
  if (character === "lin") linPanel.src = standeeAssets.lin[expression] || standeeAssets.lin.neutral;
}

function setSceneMode(mode) {
  if (!mode || !mode.includes("chapter4-mini-complete-mode")) {
    sceneCard.style.removeProperty("--chapter4-complete-image");
  }
  sceneCard.classList.remove(
    "chapter4-board-mode",
    "chapter4-memory-mode",
    "chapter4-memory-zhou-camping",
    "chapter4-memory-zhou-cat",
    "chapter4-memory-lin-home",
    "chapter4-memory-lin-beach",
    "chapter4-solo-zhou",
    "chapter4-solo-lin",
    "chapter4-mini-mode",
    "chapter4-mini-complete-mode",
    "chapter4-review-mode",
    "chapter4-owner-zhou",
    "chapter4-owner-lin",
    "mini-prompt-hidden",
    "mini-item-selected",
    "mini-cg-ready"
  );
  lifeBoard.classList.remove("active");
  miniGame.classList.remove("active");
  if (mode) {
    mode.split(/\s+/).filter(Boolean).forEach((name) => sceneCard.classList.add(name));
    sceneCard.classList.toggle("chapter4-owner-zhou", mode.includes("chapter4-memory-zhou"));
    sceneCard.classList.toggle("chapter4-owner-lin", mode.includes("chapter4-memory-lin"));
  }
}

function enterLifeBoard() {
  state.mode = "board";
  setSceneMode("chapter4-board-mode");
  chapterGoal.textContent = "生活体验板";
  renderLifeBoard();
  renderLine({
    speaker: "404",
    node: "ch04_002_choose_life_order",
    text: state.viewedZhouLifeWeek && state.viewedLinLifeWeek
      ? "两种生活都已体验。可以进入代价复核。"
      : "请选择先体验哪一种生活。",
  });
  lifeBoard.classList.add("active");
  setButtons([], { showHint: false });
}

function renderLifeBoard() {
  zhouLifeStatus.textContent = state.viewedZhouLifeWeek ? "已完成" : "未体验";
  linLifeStatus.textContent = state.viewedLinLifeWeek ? "已完成" : "未体验";
  lifeBoard.querySelector("[data-life-action='zhou']").classList.toggle("completed", state.viewedZhouLifeWeek);
  lifeBoard.querySelector("[data-life-action='lin']").classList.toggle("completed", state.viewedLinLifeWeek);
  const reviewOpen = state.viewedZhouLifeWeek && state.viewedLinLifeWeek;
  reviewCard.classList.toggle("locked", !reviewOpen);
  reviewCard.querySelector("small").textContent = reviewOpen ? "选择能承受的代价" : "两条线完成后开放";
}

function startZhouLife() {
  if (state.viewedZhouLifeWeek) {
    enterLifeBoard();
    return;
  }
  setSceneMode("chapter4-memory-mode chapter4-memory-zhou-camping");
  chapterGoal.textContent = "老城一周";
  startLinear(zhouCampingIntro, () => {
    startMiniGame("camping", () => {
      state.completedCampingSetup = true;
      addClue("轻互动：完成老城露营物品拼贴。");
      setButtons(zhouCampingChoices);
    });
  });
}

function chooseCamping(choice) {
  state.zhouLifeDetailChoice = choice;
  addClue(`露营：${campingChoiceText(choice)}`);
  startLinear(zhouCampingFeedback[choice], startZhouCat);
}

function startZhouCat() {
  setSceneMode("chapter4-memory-mode chapter4-memory-zhou-cat");
  chapterGoal.textContent = "小区流浪猫";
  startLinear(zhouCatIntro, () => {
    setButtons([
      { label: "先带去宠物医院检查", action: "cat_vet" },
      { label: "在业主群问有没有人丢猫", action: "cat_group" },
      { label: "买猫粮和纸箱，先照顾一晚", action: "cat_care" },
    ]);
  });
}

function chooseCat(choice) {
  state.zhouLifeDetailChoice = choice;
  addClue(`老城细节：${catChoiceText(choice)}`);
  startLinear(zhouCatFeedback[choice], () => {
    startLinear(zhouCatFollowUp, startZhouCost);
  });
}

function startZhouCost() {
  setSceneMode("chapter4-solo-zhou");
  chapterGoal.textContent = "老城代价";
  startLinear(zhouCostIntro, () => {
    setButtons([
      { label: "我能接受这种重复，只要它不是一成不变", action: "zhou_cost_accept" },
      { label: "我还是害怕这种重复会把我磨平", action: "zhou_cost_fear" },
      { label: "我不知道，这种安稳也让我难过", action: "zhou_cost_unsure" },
    ]);
  });
}

function chooseZhouCost(choice) {
  addClue(`老城代价感受：${zhouCostText(choice)}`);
  startLinear(zhouCostFeedback[choice], () => {
    state.viewedZhouLifeWeek = true;
    state.knownE010 = true;
    unlockEvidence("old", enterLifeBoard);
  });
}

function startLinLife() {
  if (state.viewedLinLifeWeek) {
    enterLifeBoard();
    return;
  }
  setSceneMode("chapter4-solo-lin");
  chapterGoal.textContent = "新城一周";
  startLinear(linHomeIntro, () => {
    startMiniGame("home", () => {
      state.completedNewHomeSetup = true;
      addClue("轻互动：完成新城小公寓布置。");
      // 删除选择，直接继续剧情
      startLinear(linHomeAfter, startLinBeach);
    });
  });
}

/* REMOVED: chooseHome — choices deleted, now auto-continues after mini-game */
/*
function chooseHome(choice) {
  state.linLifeDetailChoice = choice;
  addClue(`收拾新家：${homeChoiceText(choice)}`);
  startLinear(linHomeFeedback[choice], () => {
    startLinear(linHomeAfter, startLinBeach);
  });
}
*/

function startLinBeach() {
  setSceneMode("chapter4-memory-mode chapter4-memory-lin-beach");
  chapterGoal.textContent = "海边抓拍";
  startLinear(linBeachIntro, () => {
    setButtons([
      { label: "拍林夏踩水回头的瞬间", action: "beach_water" },
      { label: "拍她举着快化掉的冰淇淋", action: "beach_icecream" },
      { label: "故意拍一张她没站稳的糊照", action: "beach_blur" },
    ]);
  });
}

function chooseBeach(choice) {
  state.linLifeDetailChoice = choice;
  addClue(`新城抓拍：${beachChoiceText(choice)}`);
  startLinear(linBeachFeedback[choice], startLinMap);
}

function startLinMap() {
  setSceneMode("chapter4-solo-lin");
  chapterGoal.textContent = "陌生生活";
  startLinear(linMapIntro, () => {
    state.completedNewCityMap = true;
    addClue("新城生活地图：记录住处、晚饭、药店和避开施工的路线。");
    startLinear(linMapAfter, () => {
      state.viewedLinLifeWeek = true;
      state.knownE011 = true;
      unlockEvidence("new", enterLifeBoard);
    });
  });
}

function startCostReview() {
  if (!state.viewedZhouLifeWeek || !state.viewedLinLifeWeek) return;
  setSceneMode("chapter4-review-mode");
  chapterGoal.textContent = "代价复核";
  startLinear(costReviewIntro, () => {
    setButtons([
      { label: "我更能忍受老城的重复和无趣", action: "cost_old_city" },
      { label: "我更能忍受新城的陌生和不确定", action: "cost_new_city" },
      { label: "两种代价我都还没准备好", action: "cost_neither" },
      { label: "我开始怀疑两种生活都被世界修饰过", action: "cost_suspicious" },
    ]);
  });
}

function chooseCost(value) {
  state.lifeCostPreference = value;
  localStorage.setItem("life_cost_preference", value);
  localStorage.setItem("project002_life_cost_preference", value);
  addClue(`代价复核：${costChoiceText(value)}`);
  startLinear(costFeedback[value], () => {
    state.knownE012 = true;
    localStorage.setItem("known_E012_missing_life_pages", "true");
    localStorage.setItem("project002_known_E012", "true");
    unlockEvidence("missing", () => {
      startLinear(missingPagesLines, finishChapter);
    });
  });
}

function finishChapter() {
  state.chapterComplete = true;
  chapterGoal.textContent = "Chapter 05 已解锁";
  startLinear(chapterEndLines, () => {
    renderLine({
      speaker: "404",
      node: "chapter_04_complete",
      text: "第四章完成。下一章：最后选择。",
    });
    setButtons([
      { label: "进入第五章 ›", action: "goto_ch5" },
      { label: "打开证据", action: "open_evidence" },
      { label: "重新体验第四章", action: "restart_ch04" },
    ]);
  });
}

function startMiniGame(id, afterComplete) {
  const config = miniConfigs[id];
  activeInteraction = { id, config, placed: new Set(), afterComplete };
  selectedMiniItem = null;
  miniPromptDismissed = false;
  state.mode = "mini";
  setSceneMode("chapter4-mini-mode");
  sceneCard.classList.add(`mini-${id}`);
  sceneCard.classList.toggle("mini-layered-reveal", Boolean(config.layeredReveal));
  sceneCard.style.removeProperty("--chapter4-complete-image");
  chapterGoal.textContent = config.goal;
  renderLine({ speaker: "404", node: config.node, text: config.prompt });
  miniGame.classList.add("active");
  miniBoardImage.src = config.board;
  miniBoardImage.alt = config.goal;
  miniComplete.hidden = true;
  miniComplete.textContent = config.completeText;
  miniTray.innerHTML = "";
  miniZones.innerHTML = "";

  if (config.layeredReveal) {
    config.zones.forEach((zone) => {
      if (!zone.hintLayer) return;
      const hint = document.createElement("img");
      hint.className = "mini-hint-layer";
      hint.dataset.hintZone = zone.id;
      hint.src = zone.hintLayer;
      hint.alt = "";
      miniZones.appendChild(hint);
    });
  }

  config.items.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.miniItem = item.id;
    button.setAttribute("aria-label", item.label);
    button.title = item.label;
    button.innerHTML = `<img class="mini-item-art" src="${item.asset}" alt="" /><span>${item.label}</span>`;
    miniTray.appendChild(button);
  });

  config.zones.forEach((zone) => {
    const zoneItem = config.items.find((item) => item.zone === zone.id);
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.miniZone = zone.id;
    if (zoneItem) button.dataset.zoneItem = zoneItem.id;
    button.style.left = `${zone.left}%`;
    button.style.top = `${zone.top}%`;
    button.style.width = `${zone.width}%`;
    button.style.height = `${zone.height}%`;
    button.setAttribute("aria-label", zone.label);
    if (config.layeredReveal) {
      button.innerHTML = "";
    } else if (zoneItem) {
      button.innerHTML = `<img class="mini-zone-hint" src="${getMiniHintAsset(id, zone.id)}" alt="" />`;
    }
    miniZones.appendChild(button);
  });
  setButtons([], { showHint: false });
}

function placeMiniItem(itemId, zoneId) {
  const { config, placed } = activeInteraction;
  const item = config.items.find((entry) => entry.id === itemId);
  if (!item || placed.has(itemId)) return;
  if (item.zone !== zoneId) {
    sceneCard.classList.add("mini-drop-reject");
    window.setTimeout(() => sceneCard.classList.remove("mini-drop-reject"), 180);
    return;
  }
  placed.add(itemId);
  selectedMiniItem = null;
  miniTray.querySelector(`[data-mini-item="${itemId}"]`).disabled = true;
  miniTray.querySelector(`[data-mini-item="${itemId}"]`).classList.remove("selected");
  sceneCard.classList.remove("mini-item-selected");
  updateMiniHintFocus(null);
  const zoneButton = miniZones.querySelector(`[data-mini-zone="${zoneId}"]`);
  const zone = config.zones.find((entry) => entry.id === zoneId);
  zoneButton.classList.add("filled");
  zoneButton.innerHTML = "";
  if (zone?.skipPlacementReveal) {
    zoneButton.innerHTML = "";
  } else if (config.layeredReveal && zone?.revealLayer) {
    addMiniRevealLayer(zone.id, zone.revealLayer, getMiniLayerOrder(config, zone.id, placed.size));
  } else {
    zoneButton.innerHTML = buildMiniRevealCrop(config.complete, zone);
  }
  miniZones.querySelector(`[data-hint-zone="${zoneId}"]`)?.remove();
  const requiredCount = config.requiredCount || Math.min(4, config.items.length);
  renderLine({ speaker: "404", node: config.node, text: `${item.label}放好了。${placed.size}/${requiredCount}` });
  if (placed.size >= requiredCount) {
    miniBoardImage.src = config.complete;
    if (config.layeredReveal) {
      miniZones.querySelectorAll(".mini-reveal-layer").forEach((layer) => layer.remove());
      miniZones.querySelectorAll(".mini-hint-layer").forEach((hint) => hint.remove());
    }
    miniZones.querySelectorAll("button").forEach((button) => {
      button.disabled = true;
    });
    miniTray.hidden = true;
    miniComplete.hidden = true;
    state.mode = "miniComplete";
    sceneCard.classList.add("mini-prompt-hidden", "mini-cg-ready");
    renderLine({ speaker: "404", node: config.node, text: config.completeText });
  }
}

function startMiniDrag(event, button) {
  event.preventDefault();
  dismissMiniPrompt();
  selectMiniItem(button);

  const rect = button.getBoundingClientRect();
  const image = button.querySelector("img");
  const ghost = document.createElement("img");
  ghost.className = "mini-drag-ghost";
  ghost.src = image?.src || "";
  ghost.alt = "";
  document.body.appendChild(ghost);
  dragState = {
    button,
    ghost,
    pointerId: event.pointerId,
    offsetX: event.clientX - rect.left,
    offsetY: event.clientY - rect.top,
    moved: false,
  };
  button.classList.add("dragging");
  updateMiniDragGhost(event.clientX, event.clientY);
  try {
    button.setPointerCapture(event.pointerId);
  } catch {
    // Synthetic pointer events used by some browser test surfaces do not create an active pointer capture target.
  }
  button.addEventListener("pointermove", moveMiniDrag);
  button.addEventListener("pointerup", endMiniDrag);
  button.addEventListener("pointercancel", cancelMiniDrag);
}

function selectMiniItem(button) {
  selectedMiniItem = button.dataset.miniItem;
  sceneCard.classList.add("mini-item-selected");
  miniTray.querySelectorAll("[data-mini-item]").forEach((item) => item.classList.toggle("selected", item === button));
  const item = activeInteraction?.config.items.find((entry) => entry.id === selectedMiniItem);
  updateMiniHintFocus(item?.zone);
}

function updateMiniHintFocus(zoneId) {
  miniZones.querySelectorAll(".mini-hint-layer").forEach((hint) => {
    hint.classList.toggle("focused", hint.dataset.hintZone === zoneId);
  });
  miniZones.querySelectorAll("[data-mini-zone]").forEach((zone) => {
    zone.classList.toggle("targeted", zone.dataset.miniZone === zoneId);
  });
}

function addMiniRevealLayer(zoneId, revealLayer, order = 1) {
  const reveal = document.createElement("img");
  reveal.className = "mini-reveal-layer";
  reveal.dataset.revealZone = zoneId;
  reveal.src = revealLayer;
  reveal.alt = "";
  reveal.style.zIndex = `${10 + order}`;
  miniZones.insertBefore(reveal, miniZones.firstChild);
}

function getMiniLayerOrder(config, zoneId, fallbackOrder = 1) {
  const index = config.layerOrder?.indexOf(zoneId);
  return index === undefined || index < 0 ? fallbackOrder : index + 1;
}

function moveMiniDrag(event) {
  if (!dragState || event.pointerId !== dragState.pointerId) return;
  dragState.moved = true;
  updateMiniDragGhost(event.clientX, event.clientY);
}

function endMiniDrag(event) {
  if (!dragState || event.pointerId !== dragState.pointerId) return;
  const { button, moved } = dragState;
  const itemId = button.dataset.miniItem;
  const zone = findMiniDropZone(event.clientX, event.clientY);
  cleanupMiniDrag();
  if (moved) {
    suppressMiniClick = true;
    window.setTimeout(() => {
      suppressMiniClick = false;
    }, 80);
  }
  if (zone) placeMiniItem(itemId, zone.dataset.miniZone);
}

function cancelMiniDrag() {
  cleanupMiniDrag();
}

function cleanupMiniDrag() {
  if (!dragState) return;
  const { button, ghost, pointerId } = dragState;
  button.removeEventListener("pointermove", moveMiniDrag);
  button.removeEventListener("pointerup", endMiniDrag);
  button.removeEventListener("pointercancel", cancelMiniDrag);
  try {
    if (button.hasPointerCapture(pointerId)) button.releasePointerCapture(pointerId);
  } catch {
    // See setPointerCapture fallback above.
  }
  button.classList.remove("dragging");
  ghost?.remove();
  dragState = null;
}

function updateMiniDragGhost(clientX, clientY) {
  if (!dragState?.ghost) return;
  dragState.ghost.style.left = `${clientX}px`;
  dragState.ghost.style.top = `${clientY}px`;
}

function getMiniHintAsset(miniId, zoneId) {
  const config = miniConfigs[miniId];
  const zone = config?.zones?.find((z) => z.id === zoneId);
  if (zone?.hintLayer) return zone.hintLayer;
  const item = config?.items?.find((i) => i.zone === zoneId);
  if (item?.asset) return item.asset;
  return `./assets/chapter4/hints/${miniId}_${zoneId}_hint.png`;
}

function buildMiniRevealCrop(completeImage, zone) {
  if (!zone) return "";
  const width = 10000 / zone.width;
  const height = 10000 / zone.height;
  const left = -(zone.left * 100) / zone.width;
  const top = -(zone.top * 100) / zone.height;
  return `<img class="mini-reveal-cg" src="${completeImage}" alt="" style="width:${width}%;height:${height}%;left:${left}%;top:${top}%;" />`;
}

function findMiniDropZone(clientX, clientY) {
  return Array.from(miniZones.querySelectorAll("[data-mini-zone]")).find((zone) => {
    if (zone.disabled || zone.classList.contains("filled")) return false;
    const rect = zone.getBoundingClientRect();
    return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
  });
}

function finishMiniGame() {
  if (!activeInteraction) return;
  const callback = activeInteraction.afterComplete;
  const completeImage = activeInteraction.config.complete;
  sceneCard.style.setProperty("--chapter4-complete-image", `url("${completeImage}")`);
  closeMiniGame();
  state.mode = "linear";
  setSceneMode("chapter4-mini-complete-mode");
  if (callback) callback();
}

function closeMiniGame() {
  miniGame.classList.remove("active");
  sceneCard.classList.remove("mini-prompt-hidden", "mini-item-selected");
  sceneCard.classList.remove("mini-layered-reveal");
  sceneCard.classList.remove("mini-camping", "mini-home", "mini-map");
  miniTray.hidden = false;
  activeInteraction = null;
  selectedMiniItem = null;
  miniPromptDismissed = false;
  dragState = null;
}

function dismissMiniPrompt() {
  if (miniPromptDismissed) return;
  miniPromptDismissed = true;
  sceneCard.classList.add("mini-prompt-hidden");
}

function unlockEvidence(id, afterClose) {
  state.evidence.add(id);
  renderEvidence();
  openItem(id, afterClose);
}

function openItem(id, afterClose) {
  const item = evidenceItems[id];
  if (!item) return;
  afterItemClose = afterClose;
  itemImage.src = item.image;
  itemImage.alt = item.title;
  itemTitle.textContent = item.title;
  itemDesc.textContent = item.desc;
  itemModal.classList.add("open");
  itemModal.setAttribute("aria-hidden", "false");
}

function openEvidenceDetail(id) {
  const item = evidenceItems[id];
  if (!item) return;
  itemImage.src = item.image;
  itemImage.alt = item.title;
  itemTitle.textContent = item.title;
  itemDesc.textContent = item.desc;
  afterItemClose = null;
  itemModal.classList.add("open");
  itemModal.setAttribute("aria-hidden", "false");
}

function closeItem() {
  itemModal.classList.remove("open");
  itemModal.setAttribute("aria-hidden", "true");
  const callback = afterItemClose;
  afterItemClose = null;
  if (callback) callback();
}

function openEvidence() {
  renderEvidence();
  evidenceModal.classList.add("open");
  evidenceModal.setAttribute("aria-hidden", "false");
}

function closeEvidence() {
  evidenceModal.classList.remove("open");
  evidenceModal.setAttribute("aria-hidden", "true");
}

function openPhone() {
  phoneModal.classList.add("open");
  phoneModal.setAttribute("aria-hidden", "false");
}

function closePhone() {
  phoneModal.classList.remove("open");
  phoneModal.setAttribute("aria-hidden", "true");
}

function openLog() {
  renderLog();
  logModal.classList.add("open");
  logModal.setAttribute("aria-hidden", "false");
}

function closeLog() {
  logModal.classList.remove("open");
  logModal.setAttribute("aria-hidden", "true");
}

function renderEvidence() {
  document.querySelectorAll(".evidence-card").forEach((card) => {
    const unlocked = state.evidence.has(card.dataset.evidence);
    card.classList.toggle("locked", !unlocked);
    card.classList.toggle("unlocked", unlocked);
    card.hidden = !unlocked;
  });
  evidenceCount.textContent = `${state.evidence.size}/3`;
  evidenceEmpty.classList.toggle("hidden", state.evidence.size > 0);
  renderClues();
}

function addClue(text) {
  if (!state.clues.includes(text)) state.clues.push(text);
  renderClues();
}

function renderClues() {
  clueList.innerHTML = "";
  if (!state.clues.length) {
    const item = document.createElement("li");
    item.className = "empty";
    item.textContent = "尚未获得第四章记录。";
    clueList.appendChild(item);
    return;
  }
  state.clues.forEach((text) => {
    const item = document.createElement("li");
    item.textContent = text;
    clueList.appendChild(item);
  });
}

function setButtons(buttons, options = {}) {
  const visibleButtons = buttons.filter((item) => item.action !== "continue");
  sceneCard?.classList.toggle("has-floating-choices", visibleButtons.length > 0);
  questionGrid.hidden = false;
  if (choiceStack) choiceStack.hidden = false;
  questionGrid.classList.remove("collapsed");
  questionGrid.innerHTML = "";
  if (!visibleButtons.length) {
    questionGrid.classList.add("collapsed");
    questionGrid.hidden = true;
    if (choiceStack) choiceStack.hidden = true;
    if (options.showHint !== false) questionGrid.appendChild(questionHint);
    return;
  }
  visibleButtons.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.action = item.action;
    button.textContent = item.label;
    button.disabled = Boolean(item.disabled);
    questionGrid.appendChild(button);
  });
}

function recordDialogueLine() {
  appendLogEntry({
    kind: "dialogue",
    speaker: speaker.textContent,
    node: nodeLabel.textContent,
    text: dialogueText.textContent,
  });
}

function recordChoice(label) {
  appendLogEntry({
    kind: "choice",
    speaker: "我选择",
    node: nodeLabel.textContent,
    text: label,
  });
}

function appendLogEntry(entry) {
  const last = state.log[state.log.length - 1];
  if (last && last.kind === entry.kind && last.speaker === entry.speaker && last.node === entry.node && last.text === entry.text) {
    return;
  }
  if (last && last.kind === entry.kind && last.speaker === entry.speaker) {
    last.node = entry.node;
    last.texts = Array.isArray(last.texts) ? last.texts : [last.text].filter(Boolean);
    last.texts.push(entry.text);
    last.text = last.texts.join("\n\n");
    renderLog();
    return;
  }
  entry.texts = [entry.text];
  state.log.push(entry);
  renderLog();
}

function renderLog() {
  logList.innerHTML = "";
  state.log.slice(-80).forEach((entry) => {
    const item = document.createElement("li");
    const speakerName = document.createElement("span");
    const lines = document.createElement("div");
    item.className = `log-entry ${entry.kind === "choice" ? "choice" : "log-dialogue"} ${entry.speaker === "叙述" ? "log-narration" : ""}`;
    speakerName.className = "log-speaker";
    speakerName.textContent = entry.speaker;
    lines.className = "log-lines";
    (Array.isArray(entry.texts) ? entry.texts : [entry.text]).forEach((line) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = line;
      lines.appendChild(paragraph);
    });
    item.append(speakerName, lines);
    logList.appendChild(item);
  });
  const lineCount = state.log.reduce((count, entry) => count + (Array.isArray(entry.texts) ? entry.texts.length : 1), 0);
  logCount.textContent = `${lineCount} 条`;
  logEmpty.classList.toggle("hidden", state.log.length > 0);
}

function catChoiceText(choice) {
  return {
    vet: "先确认小猫安全",
    group: "先确认它该去哪",
    care: "先照顾一晚",
  }[choice];
}

function campingChoiceText(choice) {
  return {
    help_picnic_mat: "帮朋友铺野餐垫",
    sneak_photo: "偷偷拍一张朋友们围在一起的照片",
  }[choice];
}

function homeChoiceText(choice) {
  return {
    kitchen: "先收拾厨房",
    mat_light: "先铺地垫和小夜灯",
    balcony: "先整理阳台",
  }[choice];
}

function zhouCostText(choice) {
  return {
    accept: "能接受重复，但需要持续改造",
    fear: "害怕重复把自己磨平",
    unsure: "安稳也让人难过",
  }[choice];
}

function beachChoiceText(choice) {
  return {
    water: "拍下踩水回头",
    icecream: "拍下快化掉的冰淇淋",
    blur: "拍下没站稳的糊照",
  }[choice];
}

function costChoiceText(value) {
  return {
    old_city: "更能承受老城的重复",
    new_city: "更能承受新城的陌生",
    neither: "两种代价都还没准备好",
    suspicious: "怀疑两种生活都被修饰过",
  }[value];
}

renderEvidence();
startLinear(introLines, enterLifeBoard);


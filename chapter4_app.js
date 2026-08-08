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
    neutral: "./assets/zhou_yanchuan_waist_transparent_v1.png",
    frown: "./assets/characters/zhou_frown_waist_standee_v1.png",
    embarrassed: "./assets/characters/zhou_embarrassed_waist_standee_v1.png",
  },
  lin: {
    teasing: "./assets/lin_xia_waist_transparent_v1.png",
    serious: "./assets/characters/lin_serious_waist_standee_v1.png",
    offended: "./assets/characters/lin_offended_waist_standee_v1.png",
  },
};

const evidenceItems = {
  old: {
    title: "E010 老城生活一周记录",
    desc: "老城不是只有重复，但重复也不会消失。",
    image: "./assets/chapter4/camping_complete.png",
  },
  new: {
    title: "E011 新城试住一周记录",
    desc: "我在哪里哪里就是家，但家也要一点一点补上。",
    image: "./assets/chapter4/map_complete.png",
  },
  missing: {
    title: "E012 两种生活的缺页",
    desc: "两份生活记录都很完整，也都少了最难熬的几页。",
    image: "./assets/chapter4/home_complete.png",
  },
};

const miniConfigs = {
  camping: {
    goal: "露营物品拼贴",
    board: "./assets/chapter4/camping_board.png",
    complete: "./assets/chapter4/camping_complete.png",
    node: "ch04_003_camping_setup",
    prompt: "把至少四件物品放进营地，让这次露营真的成形。",
    items: [
      { id: "mat", label: "野餐垫", asset: "./assets/chapter4/items/camping_mat.png", zone: "mat" },
      { id: "lamp", label: "营地灯", asset: "./assets/chapter4/items/camping_lamp.png", zone: "lamp" },
      { id: "food", label: "食物袋", asset: "./assets/chapter4/items/camping_food.png", zone: "food" },
      { id: "camera", label: "相机", asset: "./assets/chapter4/items/camping_camera.png", zone: "camera" },
      { id: "jacket", label: "外套", asset: "./assets/chapter4/items/camping_jacket.png", zone: "jacket" },
    ],
    zones: [
      { id: "mat", label: "铺在草地中间", left: 26, top: 58, width: 34, height: 16 },
      { id: "lamp", label: "压住垫角", left: 56, top: 42, width: 20, height: 15 },
      { id: "food", label: "放在野餐布旁", left: 62, top: 62, width: 22, height: 15 },
      { id: "camera", label: "放在随手能拿的位置", left: 17, top: 45, width: 20, height: 15 },
      { id: "jacket", label: "放进包边，晚上会冷", left: 37, top: 36, width: 22, height: 14 },
    ],
    completeText: "露营地收拾好了。",
  },
  home: {
    goal: "新城小公寓布置",
    board: "./assets/chapter4/home_board.png",
    complete: "./assets/chapter4/home_complete.png",
    node: "ch04_006_new_home_setup",
    prompt: "把生活小物放进房间，让小公寓从能住变成像家。",
    items: [
      { id: "lamp", label: "小夜灯", asset: "./assets/chapter4/items/home_lamp.png", zone: "lamp" },
      { id: "magnet", label: "冰箱贴", asset: "./assets/chapter4/items/home_magnet.png", zone: "magnet" },
      { id: "rug", label: "地垫", asset: "./assets/chapter4/items/home_rug.png", zone: "rug" },
      { id: "dishes", label: "便宜餐具", asset: "./assets/chapter4/items/home_dishes.png", zone: "dishes" },
      { id: "controller", label: "游戏手柄", asset: "./assets/chapter4/items/home_controller.png", zone: "controller" },
    ],
    zones: [
      { id: "lamp", label: "放在窗边低桌", left: 54, top: 36, width: 21, height: 15 },
      { id: "magnet", label: "贴在冰箱门上", left: 18, top: 28, width: 19, height: 22 },
      { id: "rug", label: "铺在沙发前", left: 34, top: 64, width: 31, height: 15 },
      { id: "dishes", label: "放到小桌旁", left: 58, top: 58, width: 22, height: 15 },
      { id: "controller", label: "扔到地垫边", left: 31, top: 48, width: 25, height: 14 },
    ],
    completeText: "小公寓终于有了生活的痕迹。",
  },
  map: {
    goal: "新城生活地图标记",
    board: "./assets/chapter4/map_board.png",
    complete: "./assets/chapter4/map_complete.png",
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
  { speaker: "404", node: "ch04_001_life_board_open", text: "第三章记录已贴入生活体验板。" },
  { speaker: "404", node: "ch04_001_life_board_open", text: "本章不再判断谁更真实，而是进入两种生活。" },
  { speaker: "玩家", node: "ch04_001_life_board_open", text: "所以这次不是问我更喜欢谁。" },
  { speaker: "周砚川", character: "zhou", expression: "neutral", node: "ch04_001_life_board_open", text: "是看你能不能在那种生活里继续过下去。" },
  { speaker: "林夏", character: "lin", expression: "teasing", node: "ch04_001_life_board_open", text: "听起来像恋爱游戏突然开始检查生活能力。" },
  { speaker: "404", node: "ch04_002_choose_life_order", text: "两种生活都已开放。请选择先体验哪一种。" },
];

const zhouCampingIntro = [
  { speaker: "回忆", node: "ch04_003_zhou_weekend_camping", text: "朋友群的露营邀约真的成行了。", background: "chapter4-memory-zhou-camping" },
  { speaker: "回忆", node: "ch04_003_zhou_weekend_camping", text: "有人带炉子，有人忘了打火机，有人一路吐槽导航。", background: "chapter4-memory-zhou-camping" },
  { speaker: "周砚川", character: "zhou", expression: "neutral", node: "ch04_003_zhou_weekend_camping", text: "防潮垫、湿巾、充电宝，都在包里。", background: "chapter4-memory-zhou-camping" },
  { speaker: "玩家", node: "ch04_003_zhou_weekend_camping", text: "你怎么比我还清楚？", background: "chapter4-memory-zhou-camping" },
  { speaker: "周砚川", character: "zhou", expression: "embarrassed", node: "ch04_003_zhou_weekend_camping", text: "因为你昨天把清单发给我确认了三次。", background: "chapter4-memory-zhou-camping" },
  { speaker: "404", node: "ch04_003_camping_setup", text: "轻互动：把露营物品放到合适位置。" },
];

const zhouCampingAfter = [
  { speaker: "朋友", node: "ch04_003_zhou_weekend_camping", text: "可以啊，你们俩有点默契。", background: "chapter4-memory-zhou-camping" },
  { speaker: "玩家", node: "ch04_003_zhou_weekend_camping", text: "我只是怕来了以后什么都不会。", background: "chapter4-memory-zhou-camping" },
  { speaker: "周砚川", character: "zhou", expression: "neutral", node: "ch04_003_zhou_weekend_camping", text: "不会也没关系。有人会生火，有人会搭帐篷，你也带了很多。", background: "chapter4-memory-zhou-camping" },
];

const zhouCatIntro = [
  { speaker: "回忆", node: "ch04_004_zhou_stray_cat", text: "露营回来那天晚上，小区楼下花坛里传来很细的叫声。", background: "chapter4-memory-zhou-cat" },
  { speaker: "回忆", node: "ch04_004_zhou_stray_cat", text: "一只灰白色的小猫缩在纸箱后面，耳朵尖湿了一点。", background: "chapter4-memory-zhou-cat" },
  { speaker: "玩家", node: "ch04_004_zhou_stray_cat", text: "它怎么在这？", background: "chapter4-memory-zhou-cat" },
  { speaker: "周砚川", character: "zhou", expression: "frown", node: "ch04_004_zhou_stray_cat", text: "先确认它有没有受伤。其他事回头再想。", background: "chapter4-memory-zhou-cat" },
];

const zhouCatFeedback = {
  vet: [
    { speaker: "回忆", node: "ch04_004_zhou_stray_cat", text: "周砚川立刻查附近还开着的宠物医院。", background: "chapter4-memory-zhou-cat" },
    { speaker: "404", node: "ch04_004_zhou_stray_cat", text: "记录：你先选择确认小猫安全。" },
  ],
  group: [
    { speaker: "回忆", node: "ch04_004_zhou_stray_cat", text: "你在业主群发了照片，很快有人问猫在哪里。", background: "chapter4-memory-zhou-cat" },
    { speaker: "周砚川", character: "zhou", expression: "neutral", node: "ch04_004_zhou_stray_cat", text: "喜欢它是一回事，确认它该去哪是另一回事。", background: "chapter4-memory-zhou-cat" },
  ],
  care: [
    { speaker: "回忆", node: "ch04_004_zhou_stray_cat", text: "你们买了猫粮、纸箱和一条旧毛巾。", background: "chapter4-memory-zhou-cat" },
    { speaker: "周砚川", character: "zhou", expression: "neutral", node: "ch04_004_zhou_stray_cat", text: "信任也不是喂一次饭就有。", background: "chapter4-memory-zhou-cat" },
  ],
};

const zhouCostIntro = [
  { speaker: "回忆", node: "ch04_005_zhou_repetition_cost", text: "周一早上，闹钟响了很久。" },
  { speaker: "回忆", node: "ch04_005_zhou_repetition_cost", text: "地铁站还是一样的人流，早餐店还是排队，消息列表里还是工作。" },
  { speaker: "玩家", node: "ch04_005_zhou_repetition_cost", text: "我以为生活变好了，就不会这么烦。" },
  { speaker: "周砚川", character: "zhou", expression: "neutral", node: "ch04_005_zhou_repetition_cost", text: "不会。变好不是变成另一种人生。" },
  { speaker: "周砚川", character: "zhou", expression: "neutral", node: "ch04_005_zhou_repetition_cost", text: "它只是让你在同一种人生里，多一点能喘气的地方。" },
];

const zhouCostFeedback = {
  accept: [
    { speaker: "404", node: "ch04_005_zhou_repetition_cost", text: "界面记录：当前可以接受老城的重复，但需要持续改造。" },
    { speaker: "周砚川", character: "zhou", expression: "neutral", node: "ch04_005_zhou_repetition_cost", text: "那我们就继续把重复的地方改小一点。" },
  ],
  fear: [
    { speaker: "404", node: "ch04_005_zhou_repetition_cost", text: "界面记录：当前仍然害怕老城重复感。" },
    { speaker: "周砚川", character: "zhou", expression: "frown", node: "ch04_005_zhou_repetition_cost", text: "害怕不代表你选错。只是它确实存在。" },
  ],
  unsure: [
    { speaker: "404", node: "ch04_005_zhou_repetition_cost", text: "界面记录：当前对安稳也感到难过。" },
    { speaker: "周砚川", character: "zhou", expression: "neutral", node: "ch04_005_zhou_repetition_cost", text: "安稳不是所有人的答案，也不是每一天都能救人。" },
  ],
};

const linHomeIntro = [
  { speaker: "回忆", node: "ch04_006_lin_home_setup", text: "新城小公寓比照片里小一点，窗帘有折痕，地板角落还有一点灰。" },
  { speaker: "林夏", character: "lin", expression: "teasing", node: "ch04_006_lin_home_setup", text: "好了，宣布这里暂时归我们管。" },
  { speaker: "玩家", node: "ch04_006_lin_home_setup", text: "你是不是太快进入状态了？" },
  { speaker: "林夏", character: "lin", expression: "serious", node: "ch04_006_lin_home_setup", text: "我在哪里，哪里就是家。家可以乱，但不能脏。" },
  { speaker: "404", node: "ch04_006_new_home_setup", text: "轻互动：把生活小物放进新城小公寓。" },
];

const linHomeAfter = [
  { speaker: "回忆", node: "ch04_006_lin_home_setup", text: "房间终于像能住人。", background: "chapter4-memory-lin-home" },
  { speaker: "回忆", node: "ch04_006_lin_home_setup", text: "为了庆祝收拾好，你们点了外卖，坐在地上打游戏。", background: "chapter4-memory-lin-home" },
  { speaker: "林夏", character: "lin", expression: "teasing", node: "ch04_006_lin_home_setup", text: "赢的人不用收拾外卖盒。", background: "chapter4-memory-lin-home" },
  { speaker: "玩家", node: "ch04_006_lin_home_setup", text: "那你刚才说这里是家。", background: "chapter4-memory-lin-home" },
  { speaker: "林夏", character: "lin", expression: "teasing", node: "ch04_006_lin_home_setup", text: "家也需要公平竞争。", background: "chapter4-memory-lin-home" },
];

const linBeachIntro = [
  { speaker: "回忆", node: "ch04_007_lin_beach_icecream_photo", text: "周末，林夏拉你去海边。", background: "chapter4-memory-lin-beach" },
  { speaker: "林夏", character: "lin", expression: "teasing", node: "ch04_007_lin_beach_icecream_photo", text: "来都来了，不玩水很浪费。", background: "chapter4-memory-lin-beach" },
  { speaker: "玩家", node: "ch04_007_lin_beach_icecream_photo", text: "你这个人对“计划”两个字是不是有误解？", background: "chapter4-memory-lin-beach" },
  { speaker: "林夏", character: "lin", expression: "teasing", node: "ch04_007_lin_beach_icecream_photo", text: "计划就是为了让意外有地方发生。", background: "chapter4-memory-lin-beach" },
  { speaker: "林夏", character: "lin", expression: "serious", node: "ch04_007_lin_beach_icecream_photo", text: "相机给你。摄影师也需要被拍一下。", background: "chapter4-memory-lin-beach" },
];

const linBeachFeedback = {
  water: [
    { speaker: "回忆", node: "ch04_007_lin_beach_icecream_photo", text: "你拍下她踩进浅水、回头笑的瞬间。", background: "chapter4-memory-lin-beach" },
    { speaker: "404", node: "ch04_007_lin_beach_icecream_photo", text: "记录：玩家主动拍下林夏的新城瞬间。" },
  ],
  icecream: [
    { speaker: "回忆", node: "ch04_007_lin_beach_icecream_photo", text: "冰淇淋快要化到她手指上，你按下快门。", background: "chapter4-memory-lin-beach" },
    { speaker: "林夏", character: "lin", expression: "teasing", node: "ch04_007_lin_beach_icecream_photo", text: "这张能证明我不是新城本地刷新出来的 NPC。", background: "chapter4-memory-lin-beach" },
  ],
  blur: [
    { speaker: "回忆", node: "ch04_007_lin_beach_icecream_photo", text: "你故意拍了一张她没站稳的糊照。", background: "chapter4-memory-lin-beach" },
    { speaker: "林夏", character: "lin", expression: "offended", node: "ch04_007_lin_beach_icecream_photo", text: "很好，这张可以放进我们的黑历史相册。", background: "chapter4-memory-lin-beach" },
  ],
};

const linMapIntro = [
  { speaker: "回忆", node: "ch04_008_lin_unfamiliar_cost", text: "林夏那天有拍摄，要到晚上才回来。" },
  { speaker: "回忆", node: "ch04_008_lin_unfamiliar_cost", text: "外卖送错了楼，附近店的味道不太习惯，楼下施工声一直到傍晚。" },
  { speaker: "回忆", node: "ch04_008_lin_unfamiliar_cost", text: "这些都不是大事。但在老城，它们甚至不会被你注意到。" },
  { speaker: "玩家", node: "ch04_008_lin_unfamiliar_cost", text: "新城不只是海边、冰淇淋和照片。" },
  { speaker: "404", node: "ch04_008_new_city_map", text: "轻互动：整理新城临时生活地图。" },
];

const linMapAfter = [
  { speaker: "林夏", character: "lin", expression: "serious", node: "ch04_008_lin_unfamiliar_cost", text: "今天不顺？" },
  { speaker: "玩家", node: "ch04_008_lin_unfamiliar_cost", text: "外卖难吃，路也不认识。但我标了一张地图。" },
  { speaker: "林夏", character: "lin", expression: "serious", node: "ch04_008_lin_unfamiliar_cost", text: "这些不是你不适合这里的证据。只是这里还没被你用熟。" },
  { speaker: "林夏", character: "lin", expression: "teasing", node: "ch04_008_lin_unfamiliar_cost", text: "但你已经开始了。家不是一句话说出来的，是这么一点一点补上的。" },
];

const costReviewIntro = [
  { speaker: "404", node: "ch04_009_cost_review", text: "两种生活体验完成。" },
  { speaker: "404", node: "ch04_009_cost_review", text: "老城：朋友、社区、熟悉路线、稳定关系都在。重复、无趣、旧压力也在。" },
  { speaker: "404", node: "ch04_009_cost_review", text: "新城：海边、小公寓、重新开始、林夏的活力都在。陌生、不确定、很多事要一个人处理也在。" },
  { speaker: "玩家", node: "ch04_009_cost_review", text: "所以现在要问的不是我更喜欢哪边。" },
  { speaker: "玩家", node: "ch04_009_cost_review", text: "是我更能接受哪一种生活的代价。" },
];

const costFeedback = {
  old_city: [
    { speaker: "404", node: "ch04_009_cost_review", text: "界面记录：当前更能接受老城生活的代价。" },
    { speaker: "周砚川", character: "zhou", expression: "neutral", node: "ch04_009_cost_review", text: "重复不是失败，但它确实需要耐心。" },
    { speaker: "林夏", character: "lin", expression: "teasing", node: "ch04_009_cost_review", text: "那我暂时输给小猫和露营。" },
  ],
  new_city: [
    { speaker: "404", node: "ch04_009_cost_review", text: "界面记录：当前更能接受新城生活的代价。" },
    { speaker: "林夏", character: "lin", expression: "serious", node: "ch04_009_cost_review", text: "陌生可以慢慢标地图。" },
    { speaker: "周砚川", character: "zhou", expression: "neutral", node: "ch04_009_cost_review", text: "不确定也需要耐心。" },
  ],
  neither: [
    { speaker: "404", node: "ch04_009_cost_review", text: "界面记录：当前还不能承受任何一种完整生活。" },
    { speaker: "周砚川", character: "zhou", expression: "neutral", node: "ch04_009_cost_review", text: "这也是答案。" },
    { speaker: "林夏", character: "lin", expression: "serious", node: "ch04_009_cost_review", text: "至少不是随便选一个好看的。" },
  ],
  suspicious: [
    { speaker: "404", node: "ch04_009_cost_review", text: "界面记录：当前怀疑两种生活都被筛选过。" },
    { speaker: "林夏", character: "lin", expression: "serious", node: "ch04_009_cost_review", text: "你终于开始怀疑甜的东西了。" },
    { speaker: "周砚川", character: "zhou", expression: "frown", node: "ch04_009_cost_review", text: "太完整的生活，反而像被整理过。" },
  ],
};

const missingPagesLines = [
  { speaker: "404", node: "ch04_010_missing_pages", text: "已发现关键证据：两种生活的缺页。" },
  { speaker: "404", node: "ch04_010_missing_pages", text: "老城缺少重复到麻木的日子。新城缺少独自迷路、吃不惯、联系不上熟人的时刻。" },
  { speaker: "玩家", node: "ch04_010_missing_pages", text: "世界给我的不是答案，是最能动摇我的两个版本。" },
];

const chapterEndLines = [
  { speaker: "回忆", node: "ch04_011_chapter_end", text: "两份生活记录被并排放在桌上。" },
  { speaker: "回忆", node: "ch04_011_chapter_end", text: "它们都太真实了，真实到你开始舍不得。" },
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
  selectedMiniItem = button.dataset.miniItem;
  sceneCard.classList.add("mini-item-selected");
  miniTray.querySelectorAll("[data-mini-item]").forEach((item) => item.classList.toggle("selected", item === button));
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

  if (action.startsWith("cat_")) chooseCat(action.replace("cat_", ""));
  if (action.startsWith("zhou_cost_")) chooseZhouCost(action.replace("zhou_cost_", ""));
  if (action.startsWith("beach_")) chooseBeach(action.replace("beach_", ""));
  if (action.startsWith("cost_")) chooseCost(action.replace("cost_", ""));
  if (action === "open_evidence") openEvidence();
  if (action === "restart_ch04") window.location.reload();
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
  speaker.textContent = line.speaker;
  nodeLabel.textContent = line.node;
  dialogueText.textContent = line.text;
  if (line.character && line.expression) setActiveCharacter(line.character, line.expression);
  else setActiveCharacter(null);
  recordDialogueLine();
}

function setActiveCharacter(character, expression = "neutral") {
  zhouPanel.classList.toggle("active", character === "zhou");
  linPanel.classList.toggle("active", character === "lin");
  if (character === "zhou") zhouPanel.src = standeeAssets.zhou[expression] || standeeAssets.zhou.neutral;
  if (character === "lin") linPanel.src = standeeAssets.lin[expression] || standeeAssets.lin.teasing;
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
    "chapter4-mini-mode",
    "chapter4-mini-complete-mode",
    "chapter4-review-mode",
    "mini-prompt-hidden",
    "mini-item-selected",
    "mini-cg-ready"
  );
  lifeBoard.classList.remove("active");
  miniGame.classList.remove("active");
  if (mode) mode.split(/\s+/).filter(Boolean).forEach((name) => sceneCard.classList.add(name));
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
      startLinear(zhouCampingAfter, startZhouCat);
    });
  });
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
  startLinear(zhouCatFeedback[choice], startZhouCost);
}

function startZhouCost() {
  setSceneMode("");
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
  setSceneMode("");
  chapterGoal.textContent = "新城一周";
  startLinear(linHomeIntro, () => {
    startMiniGame("home", () => {
      state.completedNewHomeSetup = true;
      addClue("轻互动：完成新城小公寓布置。");
      startLinear(linHomeAfter, startLinBeach);
    });
  });
}

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
  setSceneMode("");
  chapterGoal.textContent = "陌生生活";
  startLinear(linMapIntro, () => {
    startMiniGame("map", () => {
      state.completedNewCityMap = true;
      addClue("轻互动：完成新城生活地图标记。");
      startLinear(linMapAfter, () => {
        state.viewedLinLifeWeek = true;
        state.knownE011 = true;
        unlockEvidence("new", enterLifeBoard);
      });
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
  addClue(`代价复核：${costChoiceText(value)}`);
  startLinear(costFeedback[value], () => {
    state.knownE012 = true;
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
    if (zoneItem) {
      button.innerHTML = `<img class="mini-zone-hint" src="${getMiniHintAsset(zoneItem.asset)}" alt="" />`;
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
  const zoneButton = miniZones.querySelector(`[data-mini-zone="${zoneId}"]`);
  const zone = config.zones.find((entry) => entry.id === zoneId);
  zoneButton.classList.add("filled");
  zoneButton.innerHTML = buildMiniRevealCrop(config.complete, zone);
  renderLine({ speaker: "404", node: config.node, text: `${item.label}放好了。${placed.size}/4` });
  if (placed.size >= 4) {
    miniBoardImage.src = config.complete;
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
  selectedMiniItem = button.dataset.miniItem;
  sceneCard.classList.add("mini-item-selected");
  miniTray.querySelectorAll("[data-mini-item]").forEach((item) => item.classList.toggle("selected", item === button));

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

function getMiniHintAsset(assetPath) {
  return assetPath.replace("/items/", "/hints/").replace(".png", "_hint.png");
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
  questionGrid.hidden = false;
  if (choiceStack) choiceStack.hidden = false;
  questionGrid.classList.remove("collapsed");
  questionGrid.innerHTML = "";
  if (!buttons.length) {
    questionGrid.classList.add("collapsed");
    questionGrid.hidden = true;
    if (choiceStack) choiceStack.hidden = true;
    if (options.showHint !== false) questionGrid.appendChild(questionHint);
    return;
  }
  buttons.forEach((item) => {
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
    speaker: "玩家选择",
    node: nodeLabel.textContent,
    text: label,
  });
}

function appendLogEntry(entry) {
  const last = state.log[state.log.length - 1];
  if (
    last &&
    last.kind === entry.kind &&
    last.speaker === entry.speaker &&
    last.node === entry.node &&
    last.text === entry.text
  ) {
    return;
  }
  state.log.push(entry);
  renderLog();
}

function renderLog() {
  logList.innerHTML = "";
  state.log.forEach((entry) => {
    const item = document.createElement("li");
    const head = document.createElement("div");
    const speakerName = document.createElement("strong");
    const nodeName = document.createElement("small");
    const text = document.createElement("p");
    speakerName.textContent = entry.speaker;
    nodeName.textContent = entry.node;
    text.textContent = entry.text;
    head.append(speakerName, nodeName);
    item.className = `log-entry ${entry.kind}`;
    item.append(head, text);
    logList.appendChild(item);
  });
  logCount.textContent = `${state.log.length} 条`;
  logEmpty.classList.toggle("hidden", state.log.length > 0);
}

function catChoiceText(choice) {
  return {
    vet: "先确认小猫安全",
    group: "先确认它该去哪",
    care: "先照顾一晚",
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

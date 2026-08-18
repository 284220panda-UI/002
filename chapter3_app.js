const state = {
  mode: "linear",
  lineIndex: 0,
  evidence: new Set(["calendar"]),
  clues: [],
  log: [],
  viewedZhouOriginMemory: false,
  viewedLinOriginMemory: false,
  knownE007: false,
  knownE008: false,
  knownE009: false,
  lifePreferenceFeeling: "none",
  lifePreferenceReason: "none",
  deductionOriginConflict: "none",
  worldUnderstanding: "unknown",
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
const timelineBoard = document.querySelector("#timelineBoard");
const feelingBoard = document.querySelector("#feelingBoard");
const originCard = document.querySelector("#originCard");
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
const judgementRow = document.querySelector("#judgementRow");
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

const standeeAssets = {
  zhou: {
    neutral: "./assets/characters/v1_full/zhou_base.png",
    frown: "./assets/characters/game_ready_v3_unified_b/zhou_frown.png",
    embarrassed: "./assets/characters/game_ready_v3_unified_b/zhou_embarrassed.png",
  },
  lin: {
    neutral: "./assets/characters/v1_full/lin_base.png",
    teasing: "./assets/characters/game_ready_v3_unified_b/lin_teasing.png",
    serious: "./assets/characters/game_ready_v3_unified_b/lin_serious.png",
    offended: "./assets/characters/game_ready_v3_unified_b/lin_speechless.png",
  },
};

const evidenceItems = {
  calendar: {
    title: "书架实体日历",
    desc: "同一晚同时写着续租截止和买票截止。",
    image: "./assets/chapter2/E006_detail.png",
  },
  stay: {
    title: "E007 留下生活改造清单",
    desc: "留下不是继续忍耐，而是把熟悉城市改成真的能生活的地方。",
    image: "./assets/chapter3/E007_detail.png",
  },
  leave: {
    title: "E008 新城旅居试住计划",
    desc: "出发不是一走了之，而是先试住一个月，看陌生地方会不会长出生活。",
    image: "./assets/chapter3/E008_detail.png",
  },
  origin: {
    title: "E009 选择前备忘：留下 / 出发",
    desc: "两段故事共同指向同一人生节点：我到底想在哪种生活里变成自己？",
    image: "./assets/chapter3/E009_detail.png",
  },
};

const introLines = [
  { speaker: "404", node: "ch03_001_after_case_conflict", text: "第二章记录已归档。" },
  { speaker: "404", node: "ch03_001_after_case_conflict", text: "异常类型从“证词冲突”升级为“故事起点不一致”。" },
  { speaker: "玩家", node: "ch03_001_after_case_conflict", text: "它现在开始把我的人生写得像故障报告。" },
  { speaker: "林夏", character: "lin", node: "ch03_001_after_case_conflict", text: "翻译一下就是：我们两个都很麻烦。" },
  { speaker: "周砚川", character: "zhou", node: "ch03_001_after_case_conflict", text: "不准确。是事件本身很麻烦。" },
  { speaker: "林夏", character: "lin", node: "ch03_001_after_case_conflict", text: "你看，他连麻烦都要校准。" },
  { speaker: "玩家", node: "ch03_002_recheck_calendar", text: "这两个日程，是同一天同一个时间。" },
  { speaker: "周砚川", character: "zhou", expression: "frown", node: "ch03_002_recheck_calendar", text: "续租截止。" },
  { speaker: "林夏", character: "lin", node: "ch03_002_recheck_calendar", text: "买票截止。" },
  { speaker: "玩家", node: "ch03_002_recheck_calendar", text: "所以我同一晚既要留下，也要出发？" },
  { speaker: "林夏", character: "lin", node: "ch03_002_recheck_calendar", text: "听起来很像你会干出来的事。" },
  { speaker: "周砚川", character: "zhou", node: "ch03_002_recheck_calendar", text: "不可能同时完成。" },
  { speaker: "404", node: "ch03_002_recheck_calendar", text: "两个事项互斥，但都能被当前证词解释。", done: () => addClue("E006 复查：续租截止与买票截止发生在同一晚，同一时间只能选择其中一种生活。") },
];

const zhouMemoryLines = [
  { speaker: "回忆", node: "ch03_004_zhou_memory_entry", text: "画面从日历重叠处淡出。" },
  { speaker: "回忆", node: "ch03_004_zhou_memory_entry", text: "楼下的路灯亮着，便利店门口贴着换季促销。" },
  { speaker: "回忆", node: "ch03_004_zhou_memory_entry", text: "你手里捧着晚饭关东煮，手机屏幕停在房东询问的续租消息。" },
  { speaker: "回忆", node: "ch03_004_zhou_memory_entry", text: "这个地方没有任何特别之处，正因为如此，才像生活。" },
  { speaker: "玩家", node: "ch03_004_zhou_memory_entry", text: "这是哪天？" },
  { speaker: "周砚川", character: "zhou", node: "ch03_004_zhou_memory_entry", text: "你要回复房东的那天。" },
  { speaker: "玩家", node: "ch03_004_zhou_memory_entry", text: "你怎么也在？" },
  { speaker: "周砚川", character: "zhou", expression: "embarrassed", node: "ch03_004_zhou_memory_entry", text: "我是你对象，我为什么不在？" },
  { speaker: "林夏", character: "lin", node: "ch03_004_zhou_memory_entry", text: "这个开场有我的风格。" },
  { speaker: "回忆", node: "ch03_005_zhou_stay_night", text: "你们没有直接回家。周砚川带你从小区门口绕到河边，又从河边折回公寓楼下。" },
  { speaker: "回忆", node: "ch03_005_zhou_stay_night", text: "路上经过早餐店、公告栏和那家你总说“有空再去”的旧书店。" },
  { speaker: "回忆", node: "ch03_005_zhou_stay_night", text: "他没有催你点续租确认，只把一张折过的纸递给你。" },
  { speaker: "玩家", node: "ch03_005_zhou_stay_night", text: "这是什么？" },
  { speaker: "周砚川", character: "zhou", node: "ch03_005_zhou_stay_night", text: "“如果留下来”的生活改造清单。" },
  { speaker: "玩家", node: "ch03_005_zhou_stay_night", text: "听起来很像租房中介会发的东西。" },
  { speaker: "周砚川", character: "zhou", node: "ch03_005_zhou_stay_night", text: "不一样。这个是按你定制写的。" },
  { speaker: "周砚川", character: "zhou", node: "ch03_005_zhou_stay_night", text: "你说房间太暗，晚上回家总像被墙堵住。所以书桌挪到窗边。" },
  { speaker: "回忆", node: "ch03_005_zhou_stay_night", text: "周砚川把纸翻到背面，是他手绘的插图。", background: "chapter3-memory-zhou-collage" },
  { speaker: "周砚川", character: "zhou", node: "ch03_005_zhou_stay_night", text: "附近新开了一家商场，你说过想去吃那家排队很久的面。", background: "chapter3-memory-zhou-collage" },
  { speaker: "周砚川", character: "zhou", node: "ch03_005_zhou_stay_night", text: "河边公园晚上人少，可以散步，不用每次下班只经过小区门口。", background: "chapter3-memory-zhou-collage" },
  { speaker: "周砚川", character: "zhou", node: "ch03_005_zhou_stay_night", text: "天气凉一点，约朋友去近郊露营。你收藏了帐篷，但一直没买。", background: "chapter3-memory-zhou-collage" },
  { speaker: "周砚川", character: "zhou", expression: "embarrassed", node: "ch03_005_zhou_stay_night", text: "还有，如果续租超过一年，可以认真考虑养一只猫或者狗。", background: "chapter3-memory-zhou-collage" },
  { speaker: "玩家", node: "ch03_005_zhou_stay_night", text: "这已经从生活清单变成五年计划了。你画画还挺有特色的。", background: "chapter3-memory-zhou-collage" },
  { speaker: "周砚川", character: "zhou", expression: "frown", node: "ch03_005_zhou_stay_night", text: "不是五年。只是证明这里可以不只是“暂时忍一下”的地方。", background: "chapter3-memory-zhou-collage" },
  { speaker: "玩家", node: "ch03_005_zhou_stay_night", text: "所以这就是留下来的生活？" },
  { speaker: "周砚川", character: "zhou", node: "ch03_005_zhou_stay_night", text: "其中一种。" },
  { speaker: "玩家", node: "ch03_005_zhou_stay_night", text: "听起来都是小事。" },
  { speaker: "周砚川", character: "zhou", node: "ch03_005_zhou_stay_night", text: "日子本来就是小事组成的。" },
  { speaker: "玩家", node: "ch03_005_zhou_stay_night", text: "可我怕的就是这个。" },
  { speaker: "周砚川", character: "zhou", expression: "frown", node: "ch03_005_zhou_stay_night", text: "怕小事？" },
  { speaker: "玩家", node: "ch03_005_zhou_stay_night", text: "怕留下以后还是这些小事。上班，回家，睡觉。" },
  { speaker: "玩家", node: "ch03_005_zhou_stay_night", text: "然后我就这样过下去。" },
  { speaker: "回忆", node: "ch03_005_zhou_stay_night", text: "周砚川停在小区门口，没有立刻回答。" },
  { speaker: "周砚川", character: "zhou", node: "ch03_005_zhou_stay_night", text: "如果你留下来只是为了继续忍，那不值得。" },
  { speaker: "玩家", node: "ch03_005_zhou_stay_night", text: "那什么才值得？" },
  { speaker: "周砚川", character: "zhou", node: "ch03_005_zhou_stay_night", text: "把这里改成你能生活的地方。" },
  { speaker: "玩家", node: "ch03_005_zhou_stay_night", text: "城市也能改？" },
  { speaker: "周砚川", character: "zhou", node: "ch03_005_zhou_stay_night", text: "城市不能。你的路线、房间、周末、回家的方式，可以。" },
  { speaker: "玩家", node: "ch03_005_zhou_stay_night", text: "听起来还是很普通。" },
  { speaker: "周砚川", character: "zhou", node: "ch03_005_zhou_stay_night", text: "普通不等于原样重复。" },
  { speaker: "玩家", node: "ch03_005_zhou_stay_night", text: "如果我最后还是想走呢？" },
  { speaker: "周砚川", character: "zhou", node: "ch03_005_zhou_stay_night", text: "我帮你搬。" },
  { speaker: "玩家", node: "ch03_005_zhou_stay_night", text: "这么干脆？" },
  { speaker: "周砚川", character: "zhou", expression: "embarrassed", node: "ch03_005_zhou_stay_night", text: "你选哪里，不改变我喜欢你这件事。" },
  { speaker: "玩家", node: "ch03_005_zhou_stay_night", text: "那这张清单呢？" },
  { speaker: "周砚川", character: "zhou", node: "ch03_005_zhou_stay_night", text: "你留下，它是计划。" },
  { speaker: "周砚川", character: "zhou", node: "ch03_005_zhou_stay_night", text: "你离开，它也有用。" },
  { speaker: "玩家", node: "ch03_005_zhou_stay_night", text: "怎么有用？" },
  { speaker: "周砚川", character: "zhou", node: "ch03_005_zhou_stay_night", text: "它证明我会在这里，我也会去找你。" },
  { speaker: "回忆", node: "ch03_006_zhou_memory_close", text: "回忆停在小区门口。" },
  { speaker: "回忆", node: "ch03_006_zhou_memory_close", text: "那张生活改造清单被折回原来的样子，折痕压过河边公园、旧书店和“以后可以养猫狗”的小字。" },
  { speaker: "404", node: "ch03_006_zhou_memory_close", text: "周砚川版本已贴入对照板。", done: () => addClue("记录：周砚川版本的留下之夜。留下不是继续忍耐，而是把熟悉城市重新整理成能生活的地方。") },
];

const linMemoryLines = [
  { speaker: "回忆", node: "ch03_007_lin_memory_entry", text: "画面从日历另一行事项亮起。" },
  { speaker: "回忆", node: "ch03_007_lin_memory_entry", text: "风从街口吹过来，橱窗玻璃里映出半个行李箱。" },
  { speaker: "回忆", node: "ch03_007_lin_memory_entry", text: "手机高铁购票页停在确认按钮前。" },
  { speaker: "玩家", node: "ch03_007_lin_memory_entry", text: "这是哪天？" },
  { speaker: "林夏", character: "lin", node: "ch03_007_lin_memory_entry", text: "你把高铁购票页打开，又退回去的那天。" },
  { speaker: "玩家", node: "ch03_007_lin_memory_entry", text: "你看见了？" },
  { speaker: "林夏", character: "lin", node: "ch03_007_lin_memory_entry", text: "嗯。手机屏幕亮了好几回，我假装在研究菜单。" },
  { speaker: "林夏", character: "lin", node: "ch03_007_lin_memory_entry", text: "本来想等你自己先说，结果咖啡都快凉了。" },
  { speaker: "周砚川", character: "zhou", node: "ch03_007_lin_memory_entry", text: "购票记录确实可以重复打开。" },
  { speaker: "林夏", character: "lin", node: "ch03_007_lin_memory_entry", text: "谢谢技术支持。" },
  { speaker: "回忆", node: "ch03_008_lin_departure_night", text: "你们坐在咖啡店门口的窄桌旁。" },
  { speaker: "回忆", node: "ch03_008_lin_departure_night", text: "林夏把相机放在桌上，旁边摊着一张新城地图，地图上贴了几张歪歪扭扭的便利贴。" },
  { speaker: "玩家", node: "ch03_008_lin_departure_night", text: "这是什么？" },
  { speaker: "林夏", character: "lin", node: "ch03_008_lin_departure_night", text: "新城旅居试住计划。" },
  { speaker: "玩家", node: "ch03_008_lin_departure_night", text: "你什么时候把它升级成计划了？" },
  { speaker: "林夏", character: "lin", node: "ch03_008_lin_departure_night", text: "我下个月在那边有个拍摄项目，一个月。" },
  { speaker: "林夏", character: "lin", node: "ch03_008_lin_departure_night", text: "新城公寓我看好了，有阳台，景色不错。" },
  { speaker: "林夏", character: "lin", node: "ch03_008_lin_departure_night", text: "而且很巧。就是你一直说“有机会想去住一阵”的新城。说那里路边的树很好看，很适合假装重新做人。" },
  { speaker: "玩家", node: "ch03_008_lin_departure_night", text: "所以你也要去？" },
  { speaker: "林夏", character: "lin", node: "ch03_008_lin_departure_night", text: "不然呢？我总不能把你寄到新城，货到付款。" },
  { speaker: "回忆", node: "ch03_008_lin_departure_night", text: "玩家看着地图。林夏用笔在小公寓附近画了一个歪歪扭扭的圈。" },
  { speaker: "林夏", character: "lin", node: "ch03_008_lin_departure_night", text: "第一天，到站，先放行李。然后给房间取名。" },
  { speaker: "玩家", node: "ch03_008_lin_departure_night", text: "为什么要取名？" },
  { speaker: "林夏", character: "lin", node: "ch03_008_lin_departure_night", text: "不取名就只是房间，取了名才像临时基地。" },
  { speaker: "玩家", node: "ch03_008_lin_departure_night", text: "你还挺会自我欺骗。" },
  { speaker: "林夏", character: "lin", node: "ch03_008_lin_departure_night", text: "谢谢，旅居必备技能之一。" },
  { speaker: "林夏", character: "lin", node: "ch03_008_lin_departure_night", text: "第二天，找最近的便利店、药店。哦，还要买一个冰淇淋吃。" },
  { speaker: "玩家", node: "ch03_008_lin_departure_night", text: "为什么要吃冰淇淋？" },
  { speaker: "林夏", character: "lin", node: "ch03_008_lin_departure_night", text: "因为第一天活下来了，第二天值得庆祝。" },
  { speaker: "玩家", node: "ch03_008_lin_departure_night", text: "第三天呢？" },
  { speaker: "林夏", character: "lin", node: "ch03_008_lin_departure_night", text: "去河边或者天桥，拍一张“我们真的来了”。" },
  { speaker: "玩家", node: "ch03_008_lin_departure_night", text: "如果我走了，会不会只是因为想逃？" },
  { speaker: "林夏", character: "lin", node: "ch03_008_lin_departure_night", text: "有可能。" },
  { speaker: "玩家", node: "ch03_008_lin_departure_night", text: "怎么都这么诚实？" },
  { speaker: "林夏", character: "lin", node: "ch03_008_lin_departure_night", text: "因为骗你没用。你会把谎话记进备忘录。" },
  { speaker: "玩家", node: "ch03_008_lin_departure_night", text: "……" },
  { speaker: "林夏", character: "lin", node: "ch03_008_lin_departure_night", text: "但逃离不一定等于失败。" },
  { speaker: "玩家", node: "ch03_008_lin_departure_night", text: "那是什么？" },
  { speaker: "林夏", character: "lin", node: "ch03_008_lin_departure_night", text: "有时候是身体先说“这里不行了”，脑子还在装听不见。" },
  { speaker: "玩家", node: "ch03_008_lin_departure_night", text: "也可能是我自己在哪里都过不好。" },
  { speaker: "回忆", node: "ch03_008_lin_departure_night", text: "林夏的笑意收住了一点，但眼睛还是亮的。" },
  { speaker: "回忆", node: "ch03_008_lin_departure_night", text: "街口的风把地图边角掀起来，她用冰淇淋店的小票把边角压住。" },
  { speaker: "林夏", character: "lin", node: "ch03_008_lin_departure_night", text: "那就从第一周开始。" },
  { speaker: "玩家", node: "ch03_008_lin_departure_night", text: "第一周能解决什么？" },
  { speaker: "林夏", character: "lin", node: "ch03_008_lin_departure_night", text: "不能解决你的人生。" },
  { speaker: "林夏", character: "lin", node: "ch03_008_lin_departure_night", text: "但能让你知道，陌生地方不是一整块黑的。" },
  { speaker: "林夏", character: "lin", node: "ch03_008_lin_departure_night", text: "它可能有难吃的外卖，有会晒到脚背的阳台。" },
  { speaker: "林夏", character: "lin", node: "ch03_008_lin_departure_night", text: "还有我。" },
  { speaker: "玩家", node: "ch03_008_lin_departure_night", text: "听起来还是很不安全。" },
  { speaker: "林夏", character: "lin", node: "ch03_008_lin_departure_night", text: "所以我们先聊晚上怎么回住处、难过的时候去哪条路走十分钟，全部标出来。" },
  { speaker: "玩家", node: "ch03_008_lin_departure_night", text: "我们？" },
  { speaker: "林夏", character: "lin", node: "ch03_008_lin_departure_night", text: "对，我们。" },
  { speaker: "回忆", node: "ch03_008_lin_departure_night", text: "手机亮了一下，高铁购票页又回到确认按钮。" },
  { speaker: "回忆", node: "ch03_008_lin_departure_night", text: "你看了很久，还是没有按。" },
  { speaker: "回忆", node: "ch03_008_lin_departure_night", text: "林夏没有抢你的手机，只把相机举起来，又很快放下。", background: "chapter3-memory-lin-camera" },
  { speaker: "玩家", node: "ch03_008_lin_departure_night", text: "你干嘛？" },
  { speaker: "林夏", character: "lin", node: "ch03_008_lin_departure_night", text: "差点拍你还没按下去的样子。" },
  { speaker: "玩家", node: "ch03_008_lin_departure_night", text: "这有什么好拍的？" },
  { speaker: "林夏", character: "lin", node: "ch03_008_lin_departure_night", text: "有。" },
  { speaker: "林夏", character: "lin", node: "ch03_008_lin_departure_night", text: "这个表情很贵，我先欠着。" },
  { speaker: "玩家", node: "ch03_008_lin_departure_night", text: "如果我最后还是留下呢？" },
  { speaker: "林夏", character: "lin", node: "ch03_008_lin_departure_night", text: "那我还是会去，但给你买一套睡衣，等你下次来。" },
  { speaker: "玩家", node: "ch03_008_lin_departure_night", text: "就这样？" },
  { speaker: "林夏", character: "lin", node: "ch03_008_lin_departure_night", text: "不然呢？把你绑上车吗？" },
  { speaker: "玩家", node: "ch03_008_lin_departure_night", text: "你不会失望？" },
  { speaker: "林夏", character: "lin", node: "ch03_008_lin_departure_night", text: "会啊。但我会失望，不代表你欠我一个出发。" },
  { speaker: "回忆", node: "ch03_008_lin_departure_night", text: "林夏把地图折起来，又故意露出那张写着冰淇淋的便利贴。" },
  { speaker: "林夏", character: "lin", node: "ch03_008_lin_departure_night", text: "不过在你按下确认之前，我可以继续诱惑你。" },
  { speaker: "玩家", node: "ch03_008_lin_departure_night", text: "用冰淇淋？" },
  { speaker: "林夏", character: "lin", node: "ch03_008_lin_departure_night", text: "用一个月的未知、阳台、乱七八糟的街景，和一个很会拍照的人。" },
  { speaker: "回忆", node: "ch03_009_lin_memory_close", text: "回忆停在林夏把地图折起来的瞬间。" },
  { speaker: "回忆", node: "ch03_009_lin_memory_close", text: "那张写着冰淇淋的便利贴露在最外面，像故意留给你看的标记。" },
  { speaker: "404", node: "ch03_009_lin_memory_close", text: "林夏版本已贴入对照板。", done: () => addClue("记录：林夏版本的出发前夜。出发不是一走了之，而是和林夏一起试着让新城长出生活。") },
];

const commonOriginLines = [
  { speaker: "404", node: "ch03_010_common_origin_unlocked", text: "两个版本已对齐。" },
  { speaker: "404", node: "ch03_010_common_origin_unlocked", text: "相同部分：玩家、日期、犹豫、城市选择。" },
  { speaker: "404", node: "ch03_010_common_origin_unlocked", text: "不同部分：留下后的故事，出发后的故事。" },
  { speaker: "玩家", node: "ch03_010_common_origin_unlocked", text: "也就是说，分开的不是他们。" },
  { speaker: "404", node: "ch03_010_common_origin_unlocked", text: "当前证据更支持：分开的是选择之后的生活。" },
  { speaker: "玩家", node: "ch03_011_ask_before_choice", text: "在我做选择之前，你们记得的是同一个我吗？" },
  { speaker: "周砚川", character: "zhou", node: "ch03_011_ask_before_choice", text: "应该是。" },
  { speaker: "周砚川", character: "zhou", node: "ch03_011_ask_before_choice", text: "你会先列清单。" },
  { speaker: "林夏", character: "lin", node: "ch03_011_ask_before_choice", text: "然后把清单放着不看。" },
  { speaker: "周砚川", character: "zhou", node: "ch03_011_ask_before_choice", text: "但你会记得它在哪里。" },
  { speaker: "林夏", character: "lin", node: "ch03_011_ask_before_choice", text: "你看，这部分我们没有冲突。" },
  { speaker: "周砚川", character: "zhou", expression: "frown", node: "ch03_011_ask_before_choice", text: "冲突出现在决定之后。" },
  { speaker: "玩家", node: "ch03_011_ask_before_choice", text: "所以不是我先认识了谁。" },
  { speaker: "周砚川", character: "zhou", node: "ch03_011_ask_before_choice", text: "现有证据不是。" },
  { speaker: "林夏", character: "lin", node: "ch03_011_ask_before_choice", text: "更像是你先走进了哪种生活。" },
  { speaker: "404", node: "ch03_012_origin_evidence", text: "已发现共同起点证据。", done: () => addClue("共同起点：两段关系证词之前，玩家已经在“留下 / 出发”之间犹豫。") },
];

const feelingFeedback = {
  stay: [
    { speaker: "周砚川", character: "zhou", node: "ch03_013_life_feeling_check", text: "这只是现在的感受，不需要急着定下来。" },
    { speaker: "林夏", character: "lin", node: "ch03_013_life_feeling_check", text: "好吧，公园和猫狗暂时领先。" },
  ],
  leave: [
    { speaker: "林夏", character: "lin", node: "ch03_013_life_feeling_check", text: "先声明，阳台照片我已经想好构图了。" },
    { speaker: "周砚川", character: "zhou", node: "ch03_013_life_feeling_check", text: "偏好不等于结论。" },
  ],
  both: [
    { speaker: "林夏", character: "lin", node: "ch03_013_life_feeling_check", text: "贪心一点也不是坏事。" },
    { speaker: "周砚川", character: "zhou", expression: "frown", node: "ch03_013_life_feeling_check", text: "但要分清向往和证据。" },
  ],
  uneasy: [
    { speaker: "周砚川", character: "zhou", expression: "frown", node: "ch03_013_life_feeling_check", text: "不安合理。" },
    { speaker: "林夏", character: "lin", node: "ch03_013_life_feeling_check", text: "嗯。太像真的，才吓人。" },
  ],
};

const reasonOptions = {
  stay: [
    ["因为熟悉的城市也可以重新开始", "familiar_restart"],
    ["因为周砚川让我感觉被接住", "held_by_zhou"],
    ["因为我害怕重新漂浮", "fear_floating"],
  ],
  leave: [
    ["因为新城本来就是我想去住一阵的地方", "wanted_new_city"],
    ["因为林夏让未知变得有期待", "lin_makes_unknown_warm"],
    ["因为我害怕继续忍耐", "fear_enduring"],
  ],
  both: [
    ["因为两边都像真实生活，不像谎言", "both_real"],
    ["因为我想要稳定，也想要新的可能", "stable_and_possible"],
    ["因为我开始怀疑这不是二选一的问题", "not_binary"],
  ],
  uneasy: [
    ["因为任何选择都会失去另一种生活", "loss_of_other_life"],
    ["因为两边都太真实，反而更可疑", "too_real"],
    ["因为我不知道这是记忆，还是诱导", "memory_or_guidance"],
  ],
};

const deductionFeedback = {
  city_choice: [
    { speaker: "404", node: "ch03_014_third_deduction", text: "阶段判断已记录：城市选择是分岔点。" },
    { speaker: "周砚川", character: "zhou", node: "ch03_014_third_deduction", text: "这个判断符合现有证据。" },
    { speaker: "林夏", character: "lin", node: "ch03_014_third_deduction", text: "听起来像下一章会很难选。" },
  ],
  relationship_start: [
    { speaker: "404", node: "ch03_014_third_deduction", text: "阶段判断已记录：关系起点分歧。" },
    { speaker: "周砚川", character: "zhou", expression: "frown", node: "ch03_014_third_deduction", text: "证据更早。" },
    { speaker: "林夏", character: "lin", node: "ch03_014_third_deduction", text: "也就是说，麻烦比我们还早。" },
  ],
  memory_tampering: [
    { speaker: "404", node: "ch03_014_third_deduction", text: "阶段判断已记录：记忆篡改可能。" },
    { speaker: "林夏", character: "lin", node: "ch03_014_third_deduction", text: "如果是篡改，那篡改的人很懂生活细节。" },
    { speaker: "周砚川", character: "zhou", expression: "frown", node: "ch03_014_third_deduction", text: "难度太高，但不能完全排除。" },
  ],
  incomplete_stories: [
    { speaker: "404", node: "ch03_014_third_deduction", text: "阶段判断已记录：两个故事均不完整。" },
    { speaker: "周砚川", character: "zhou", node: "ch03_014_third_deduction", text: "谨慎。" },
    { speaker: "林夏", character: "lin", node: "ch03_014_third_deduction", text: "但谨慎不等于不用继续看。" },
  ],
};

const chapterEndLines = [
  { speaker: "玩家", node: "ch03_015_chapter_end", text: "如果分开的不是你们，是我的选择呢？" },
  { speaker: "林夏", character: "lin", node: "ch03_015_chapter_end", text: "那我好像不能只怪他抢人了。" },
  { speaker: "周砚川", character: "zhou", expression: "embarrassed", node: "ch03_015_chapter_end", text: "我也不能只判断她的信息来源异常。" },
  { speaker: "林夏", character: "lin", node: "ch03_015_chapter_end", text: "你承认刚才一直在怀疑我了？" },
  { speaker: "周砚川", character: "zhou", node: "ch03_015_chapter_end", text: "是。" },
  { speaker: "林夏", character: "lin", expression: "offended", node: "ch03_015_chapter_end", text: "……你真的很不适合说谎。" },
  { speaker: "玩家", node: "ch03_015_chapter_end", text: "所以，留下来的生活是真的。" },
  { speaker: "玩家", node: "ch03_015_chapter_end", text: "出发后的生活也是真的。" },
  { speaker: "404", node: "ch03_015_chapter_end", text: "当前结论未完全确认。两个生活片段已开放。Chapter 04 已解锁：两种生活。" },
];

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;
    if (action === "phone") openPhone();
    if (action === "evidence") openEvidence();
    if (action === "log") openLog();
  });
});

document.querySelector("#closeEvidence").addEventListener("click", closeEvidence);
document.querySelector("#closeLog").addEventListener("click", closeLog);
document.querySelector("#closePhone").addEventListener("click", closePhone);
document.querySelector("#closeItem").addEventListener("click", closeItem);

dialoguePanel.addEventListener("click", () => {
  if (state.mode === "linear") advanceLine();
});

questionGrid.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button || button.disabled) return;
  recordChoice(button.textContent);
  handleAction(button.dataset.action);
});

timelineBoard.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-board-action]");
  if (!button || button.classList.contains("locked")) return;
  recordChoice(button.dataset.boardLabel || "查看时间对照板");
  const action = button.dataset.boardAction;
  if (action === "zhou") startZhouMemory();
  if (action === "lin") startLinMemory();
  if (action === "origin") startCommonOrigin();
});

feelingBoard.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-feeling]");
  if (!button) return;
  recordChoice(button.querySelector("span").textContent);
  chooseFeeling(button.dataset.feeling);
});

document.querySelectorAll("[data-judge]").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.disabled || judgementRow.classList.contains("locked")) return;
    recordChoice(button.textContent);
    chooseDeduction(button.dataset.judge);
    closeEvidence();
  });
});

document.querySelector("[data-phone-action='board']").addEventListener("click", () => {
  closePhone();
  if (state.mode !== "linear") enterBoard();
});

evidenceModal.addEventListener("click", (event) => {
  if (event.target === evidenceModal) closeEvidence();
  const card = event.target.closest(".evidence-card.unlocked");
  if (card) openEvidenceDetail(card.dataset.evidence);
});

phoneModal.addEventListener("click", (event) => {
  if (event.target === phoneModal) closePhone();
});

logModal.addEventListener("click", (event) => {
  if (event.target === logModal) closeLog();
});

itemModal.addEventListener("click", (event) => {
  if (event.target === itemModal) closeItem();
});

function handleAction(action) {
  if (action === "continue") advanceLine();
  if (action === "open_board") enterBoard();
  if (action.startsWith("reason_")) chooseReason(action.replace("reason_", ""));
  if (action === "deduction") enterDeduction();
  if (action.startsWith("judge_")) chooseDeduction(action.replace("judge_", ""));
  if (action === "open_evidence") openEvidence();
  if (action === "restart_ch03") window.location.reload();
  if (action === "goto_ch4" && window.P002ChapterMenu) window.P002ChapterMenu.gotoNext();
}

function startLinear(lines, onDone) {
  state.mode = "linear";
  currentLines = lines;
  afterLinear = onDone;
  state.lineIndex = 0;
  setButtons([{ label: "点击继续", action: "continue" }]);
  renderLine(currentLines[0]);
}

function advanceLine() {
  if (state.mode !== "linear") return;
  state.lineIndex += 1;
  if (state.lineIndex >= currentLines.length) {
    const callback = afterLinear;
    afterLinear = null;
    if (callback) callback();
    return;
  }
  renderLine(currentLines[state.lineIndex]);
}

function renderLine(line) {
  speaker.textContent = displaySpeakerName(line.speaker);
  dialoguePanel.classList.toggle("is-narration", !line.character && displaySpeakerName(line.speaker) === "叙述");
  nodeLabel.textContent = "";
  dialogueText.textContent = line.text;
  if (line.background) setSceneMode(line.background);
  updateCharacter(line.character, line.expression);
  recordDialogueLine();
  if (line.done) line.done();
}

function displaySpeakerName(name) {
  if (name === "玩家") return "我";
  if (name === "回忆" || name === "404") return "叙述";
  return name;
}

function updateCharacter(character, expression) {
  zhouPanel.classList.toggle("active", character === "zhou");
  linPanel.classList.toggle("active", character === "lin");
  if (character === "zhou") {
    zhouPanel.src = standeeAssets.zhou[expression] || standeeAssets.zhou.neutral;
  }
  if (character === "lin") {
    linPanel.src = standeeAssets.lin[expression] || standeeAssets.lin.neutral;
  }
}

function setSceneMode(mode) {
  sceneCard.classList.remove(
    "chapter3-board-mode",
    "chapter3-origin-mode",
    "chapter3-feeling-mode",
    "chapter3-deduction-mode",
    "chapter3-memory-mode",
    "chapter3-memory-zhou",
    "chapter3-memory-zhou-collage",
    "chapter3-memory-lin",
    "chapter3-memory-lin-camera"
  );
  timelineBoard.classList.remove("active");
  feelingBoard.classList.remove("active");
  if (mode) sceneCard.classList.add(mode);
}

function enterBoard() {
  state.mode = "board";
  setSceneMode("chapter3-board-mode");
  chapterGoal.textContent = "时间对照板";
  const originUnlocked = state.viewedZhouOriginMemory && state.viewedLinOriginMemory;
  renderBoardState();
  renderLine({
    speaker: "404",
    node: "ch03_003_timeline_board_open",
    text: state.viewedZhouOriginMemory || state.viewedLinOriginMemory
      ? originUnlocked
        ? "两条记录都已贴好。可以开始分析共同起点。"
        : "请选择还没有回看的版本。"
      : "已建立临时对照板。请选择一个版本回看。",
  });
  timelineBoard.classList.add("active");
  setButtons([], { showHint: false });
}

function renderBoardState() {
  const originUnlocked = state.viewedZhouOriginMemory && state.viewedLinOriginMemory;
  originCard.classList.toggle("locked", !originUnlocked);
}

function startZhouMemory() {
  if (state.viewedZhouOriginMemory) {
    enterBoard();
    return;
  }
  setSceneMode("chapter3-memory-mode");
  sceneCard.classList.add("chapter3-memory-zhou");
  chapterGoal.textContent = "留下来的那晚";
  startLinear(zhouMemoryLines, () => {
    state.viewedZhouOriginMemory = true;
    state.knownE007 = true;
    unlockEvidence("stay", () => enterBoard());
  });
}

function startLinMemory() {
  if (state.viewedLinOriginMemory) {
    enterBoard();
    return;
  }
  setSceneMode("chapter3-memory-mode");
  sceneCard.classList.add("chapter3-memory-lin");
  chapterGoal.textContent = "出发前的那晚";
  startLinear(linMemoryLines, () => {
    state.viewedLinOriginMemory = true;
    state.knownE008 = true;
    unlockEvidence("leave", () => enterBoard());
  });
}

function startCommonOrigin() {
  if (!state.viewedZhouOriginMemory || !state.viewedLinOriginMemory) return;
  setSceneMode("chapter3-origin-mode");
  chapterGoal.textContent = "共同起点";
  startLinear(commonOriginLines, () => {
    state.knownE009 = true;
    unlockEvidence("origin", () => enterFeeling());
  });
}

function enterFeeling() {
  state.mode = "feeling";
  setSceneMode("chapter3-feeling-mode");
  chapterGoal.textContent = "生活感受记录";
  renderLine({
    speaker: "玩家",
    node: "ch03_013_life_feeling_check",
    text: "哪一种生活现在更打动我？",
  });
  feelingBoard.classList.add("active");
  setButtons([], { showHint: false });
}

function chooseFeeling(feeling) {
  state.lifePreferenceFeeling = feeling;
  localStorage.setItem("life_preference_feeling", feeling);
  localStorage.setItem("project002_life_preference_feeling", feeling);
  feelingBoard.classList.remove("active");
  addClue(`感受：${feelingLabel(feeling)}`);
  renderLine({
    speaker: "玩家",
    node: "ch03_013_life_feeling_check",
    text: "为什么会这样想？",
  });
  setButtons(reasonOptions[feeling].map(([label, id]) => ({ label, action: `reason_${id}` })));
}

function chooseReason(reason) {
  state.lifePreferenceReason = reason;
  addClue(`感受理由：${reasonText(reason)}`);
  startLinear(feelingFeedback[state.lifePreferenceFeeling], () => enterDeduction());
}

function enterDeduction() {
  state.mode = "deduction";
  setSceneMode("chapter3-deduction-mode");
  chapterGoal.textContent = "第三次阶段判断";
  judgementRow.classList.remove("locked");
  renderLine({
    speaker: "玩家",
    node: "ch03_014_third_deduction",
    text: "两个故事从哪里开始分开？",
  });
  setButtons([
    { label: "从选择居住城市开始分开", action: "judge_city_choice" },
    { label: "从我认识他们开始分开", action: "judge_relationship_start" },
    { label: "其中一个人篡改了记忆", action: "judge_memory_tampering" },
    { label: "目前只能确认两个故事都不完整", action: "judge_incomplete_stories" },
  ]);
}

function chooseDeduction(value) {
  state.deductionOriginConflict = value;
  state.worldUnderstanding = {
    city_choice: "emerging",
    relationship_start: "partial",
    memory_tampering: "suspicious",
    incomplete_stories: "cautious",
  }[value] || "unknown";
  localStorage.setItem("world_understanding", state.worldUnderstanding);
  localStorage.setItem("project002_world_understanding", state.worldUnderstanding);
  addClue(`判断：${deductionText(value)}`);
  judgementRow.classList.add("locked");
  startLinear(deductionFeedback[value], () => finishChapter());
}

function finishChapter() {
  state.chapterComplete = true;
  chapterGoal.textContent = "Chapter 04 已解锁";
  startLinear(chapterEndLines, () => {
    renderLine({
      speaker: "404",
      node: "chapter_03_complete",
      text: "第三章完成。下一章：两种生活。",
    });
    setButtons([
      { label: "进入第四章 ›", action: "goto_ch4" },
      { label: "打开证据", action: "open_evidence" },
      { label: "重新体验第三章", action: "restart_ch03" },
    ]);
  });
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
  evidenceCount.textContent = `${state.evidence.size}/4`;
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
    item.textContent = "尚未获得第三章记录。";
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

function feelingLabel(feeling) {
  return {
    stay: "喜欢留下的生活",
    leave: "期待出发的生活",
    both: "两边都向往",
    uneasy: "两边都不安",
  }[feeling];
}

function reasonText(reason) {
  const allReasons = Object.values(reasonOptions).flat();
  const found = allReasons.find(([, id]) => id === reason);
  return found ? found[0] : reason;
}

function deductionText(value) {
  return {
    city_choice: "城市选择是分岔点",
    relationship_start: "关系起点分歧",
    memory_tampering: "记忆篡改可能",
    incomplete_stories: "两个故事均不完整",
  }[value];
}

renderEvidence();
startLinear(introLines, enterBoard);

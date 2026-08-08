const state = {
  mode: "linear",
  lineIndex: 0,
  selectedCharacter: null,
  evidence: new Set(),
  itemQueue: [],
  clues: [],
  log: [],
  shownChatToZhou: false,
  shownChatToLin: false,
  askedZhouStory: false,
  askedLinStory: false,
  viewedZhouKeyMemory: false,
  viewedLinPhotoMemory: false,
  shownKeyToLin: false,
  shownAlbumToZhou: false,
  phoneUnlocked: false,
  deductionDone: false,
  detailTarget: null,
  roomView: "center",
};

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

const evidenceClues = {
  chat: "异常聊天截图：同一句“今晚别忘了”，被两个人解释成不同约定。",
  key: "E004：备用钥匙扣与维修便签，记录了一次门锁故障后的生活痕迹。",
  album: "E005：墙上拍立得与生活抓拍，记录了一次约拍之外的生活观察。",
  calendar: "E006：书架实体日历，同一天被分成“留下”和“新城”两组安排。",
};

const evidenceItems = {
  chat: {
    title: "异常聊天截图",
    desc: "第一章矛盾记录，可分别展示给周砚川和林夏。",
    image: "./assets/evidence/evidence_chat_snapshot_v1.png",
  },
  key: {
    title: "备用钥匙扣与维修便签",
    desc: "房间抽屉里的生活证据，和门锁故障后的处理有关。",
    image: "./assets/chapter2/E004_detail.png",
  },
  album: {
    title: "墙上拍立得：约拍成片与生活抓拍",
    desc: "照片墙上混着约拍构图和生活抓拍，记录了一次拍摄后的关系变化。",
    image: "./assets/chapter2/E005_detail.png",
  },
  calendar: {
    title: "书架实体日历",
    desc: "日历上同一天被分成“留下”和“新城”两组安排。",
    image: "./assets/chapter2/E006_detail.png",
  },
};

const introLines = [
  { speaker: "404", node: "ch02_001_reopen_case", text: "第一章记录已归档。" },
  { speaker: "404", node: "ch02_001_reopen_case", text: "建议：拿证据问当事人。" },
  { speaker: "玩家", node: "ch02_001_reopen_case", text: "说得像我真的在办案。" },
  { speaker: "林夏", character: "lin", expression: "teasing", node: "ch02_001_reopen_case", text: "你现在这个表情，挺像。" },
  { speaker: "周砚川", character: "zhou", expression: "neutral", node: "ch02_001_reopen_case", text: "核对事实是有效方法。" },
  { speaker: "林夏", character: "lin", expression: "teasing", node: "ch02_001_reopen_case", text: "你看，他已经进入会议状态了。" },
  { speaker: "404", node: "ch02_002_evidence_tutorial", text: "选择证据后，可以展示给指定人物。同一证据可能得到不同回答。" },
  { speaker: "404", node: "ch02_002_evidence_tutorial", text: "我只负责贴线索，不负责替你尴尬。" },
];

const zhouChatLines = [
  { speaker: "玩家", node: "ch02_003a_zhou_chat_response", text: "有印象吗？" },
  { speaker: "周砚川", character: "zhou", expression: "neutral", node: "ch02_003a_zhou_chat_response", text: "房东催续租那晚。" },
  { speaker: "玩家", node: "ch02_003a_zhou_chat_response", text: "你怎么确定？" },
  { speaker: "周砚川", character: "zhou", expression: "frown", node: "ch02_003a_zhou_chat_response", text: "时间对得上。你把合同页打开过，但没有确认。" },
  { speaker: "玩家", node: "ch02_003a_zhou_chat_response", text: "后面那句“临阵脱逃”不像你会说。" },
  { speaker: "周砚川", character: "zhou", expression: "neutral", node: "ch02_003a_zhou_chat_response", text: "措辞不像。意思接近。" },
  { speaker: "周砚川", character: "zhou", expression: "neutral", node: "ch02_003a_zhou_chat_response", text: "你遇到长期决定，会先停在门口犹豫。" },
  { speaker: "玩家", node: "ch02_003a_zhou_chat_response", text: "……" },
  { speaker: "周砚川", character: "zhou", expression: "embarrassed", node: "ch02_003a_zhou_chat_response", text: "如果是续租，我能解释前半句。后半句不像我的语气。", done: () => {
    state.shownChatToZhou = true;
    addClue("周砚川认为“今晚别忘了”指向续租、通勤和留在习惯城市的稳定生活决定。");
  } },
];

const linChatLines = [
  { speaker: "玩家", node: "ch02_003b_lin_chat_response", text: "像你发的吗？" },
  { speaker: "林夏", character: "lin", expression: "serious", node: "ch02_003b_lin_chat_response", text: "后半句像。尤其是“临阵脱逃”。" },
  { speaker: "玩家", node: "ch02_003b_lin_chat_response", text: "你当时在说什么？" },
  { speaker: "林夏", character: "lin", expression: "teasing", node: "ch02_003b_lin_chat_response", text: "票。去新城那张。" },
  { speaker: "玩家", node: "ch02_003b_lin_chat_response", text: "我没买？" },
  { speaker: "林夏", character: "lin", expression: "serious", node: "ch02_003b_lin_chat_response", text: "你把确认页打开，又退回去。" },
  { speaker: "玩家", node: "ch02_003b_lin_chat_response", text: "听起来像我。" },
  { speaker: "林夏", character: "lin", expression: "teasing", node: "ch02_003b_lin_chat_response", text: "不止一次。" },
  { speaker: "林夏", character: "lin", expression: "serious", node: "ch02_003b_lin_chat_response", text: "后来你开始算押金、家具、早餐店，还有那家你其实只吃过两次的馄饨。" },
  { speaker: "玩家", node: "ch02_003b_lin_chat_response", text: "我连馄饨都要算？" },
  { speaker: "林夏", character: "lin", expression: "teasing", node: "ch02_003b_lin_chat_response", text: "你会。你对一座城市都会有愧疚感。", done: () => {
    state.shownChatToLin = true;
    addClue("林夏认为“今晚别忘了”指向新城市车票和一次真正离开的约定。");
  } },
];

const zhouStoryLines = [
  { speaker: "玩家", node: "ask_zhou_first_story", text: "我们是怎么认识的？" },
  { speaker: "周砚川", character: "zhou", expression: "neutral", node: "ask_zhou_first_story", text: "同栋楼。我住楼下。" },
  { speaker: "周砚川", character: "zhou", expression: "neutral", node: "ask_zhou_first_story", text: "一开始只是见过几次。同楼生活里那些小故障，你都碰到过。" },
  { speaker: "玩家", node: "ask_zhou_first_story", text: "听起来我和这栋楼关系不太好。" },
  { speaker: "周砚川", character: "zhou", expression: "embarrassed", node: "ask_zhou_first_story", text: "你当时也这么说。" },
  { speaker: "周砚川", character: "zhou", expression: "neutral", node: "ask_zhou_first_story", text: "真正熟起来，是门锁那次。" },
  { speaker: "周砚川", character: "zhou", expression: "frown", node: "ask_zhou_first_story", text: "你被锁在门外，物业电话没人接。我下班回来刚好路过。" },
  { speaker: "周砚川", character: "zhou", expression: "neutral", node: "ask_zhou_first_story", text: "那种门锁我处理过类似情况，就帮你打电话联系维修，也看了一下备用钥匙的问题。", done: () => {
    state.askedZhouStory = true;
    addClue("周砚川版本：同栋公寓近邻，关系真正变近来自门锁故障、备用钥匙和反复出现的生活问题。");
  } },
];

const linStoryLines = [
  { speaker: "玩家", node: "ask_lin_first_story", text: "我们是怎么认识的？" },
  { speaker: "林夏", character: "lin", expression: "teasing", node: "ask_lin_first_story", text: "你约我拍照。" },
  { speaker: "玩家", node: "ask_lin_first_story", text: "我主动找你的？" },
  { speaker: "林夏", character: "lin", expression: "serious", node: "ask_lin_first_story", text: "嗯。你在平台上发来的需求很认真。" },
  { speaker: "玩家", node: "ask_lin_first_story", text: "我写了什么？" },
  { speaker: "林夏", character: "lin", expression: "teasing", node: "ask_lin_first_story", text: "“需要一组看起来没有班味的照片”。" },
  { speaker: "玩家", node: "ask_lin_first_story", text: "听起来像我会写在需求备注里的话。" },
  { speaker: "林夏", character: "lin", expression: "serious", node: "ask_lin_first_story", text: "本人到场以后更认真，站得像在等面试结果。" },
  { speaker: "玩家", node: "ask_lin_first_story", text: "所以没拍出来？" },
  { speaker: "林夏", character: "lin", expression: "teasing", node: "ask_lin_first_story", text: "前半小时基本没有。你越想生活化，越像在完成 KPI。" },
  { speaker: "林夏", character: "lin", expression: "serious", node: "ask_lin_first_story", text: "后来风把你的头发吹乱了，你第一反应不是整理，是去按住快掉的纸袋。" },
  { speaker: "林夏", character: "lin", expression: "teasing", node: "ask_lin_first_story", text: "那张比前面十几张都好。很生活，很有趣。", done: () => {
    state.askedLinStory = true;
    addClue("林夏版本：第一次见面是一次“去班味”的生活化约拍，她记住的是玩家终于停止证明自己的瞬间。");
  } },
];

const keyToZhouMemoryLines = [
  { speaker: "玩家", node: "show_key_to_zhou_memory", text: "这个也是那次留下的？" },
  { speaker: "周砚川", character: "zhou", expression: "embarrassed", node: "show_key_to_zhou_memory", text: "嗯。你说它丑，但找得到。" },
  { speaker: "周砚川", character: "zhou", expression: "frown", node: "show_key_to_zhou_memory", text: "那天你在门外站了很久。" },
  { speaker: "回忆", node: "zhou_door_lock_memory", text: "傍晚的楼道灯亮得有点慢。门锁短促地响了一声，然后彻底安静。", memory: "zhou" },
  { speaker: "玩家", node: "zhou_door_lock_memory", text: "别装死，我知道你还有电。", memory: "zhou" },
  { speaker: "周砚川", character: "zhou", expression: "neutral", node: "zhou_door_lock_memory", text: "没电了。", memory: "zhou" },
  { speaker: "玩家", node: "zhou_door_lock_memory", text: "它刚才还活着。", memory: "zhou" },
  { speaker: "周砚川", character: "zhou", expression: "neutral", node: "zhou_door_lock_memory", text: "这种型号断电前会提示。", memory: "zhou" },
  { speaker: "周砚川", character: "zhou", expression: "frown", node: "zhou_door_lock_memory", text: "我先帮你联系物业。这个我之前处理过一次。", memory: "zhou" },
  { speaker: "玩家", node: "zhou_door_lock_memory", text: "我声明一下，这不是我的问题。", memory: "zhou" },
  { speaker: "周砚川", character: "zhou", expression: "embarrassed", node: "zhou_door_lock_memory", text: "嗯。门锁的问题。", memory: "zhou" },
  { speaker: "周砚川", character: "zhou", expression: "frown", node: "zhou_door_lock_memory", text: "但备用钥匙放第二层，是你的问题。", memory: "zhou" },
  { speaker: "玩家", node: "zhou_door_lock_memory", text: "这个时候就不要说我了吧？你专心处理门锁还是处理我的生活不良习惯？", memory: "zhou" },
  { speaker: "周砚川", character: "zhou", expression: "neutral", node: "zhou_door_lock_memory", text: "都在处理。", memory: "zhou" },
  { speaker: "周砚川", character: "zhou", expression: "neutral", node: "zhou_door_lock_memory", text: "你能找到比较重要。推荐你换成这个。", memory: "zhou" },
  { speaker: "玩家", node: "zhou_door_lock_memory", text: "这也太额……那好看呢？", memory: "zhou" },
  { speaker: "周砚川", character: "zhou", expression: "embarrassed", node: "zhou_door_lock_memory", text: "排第二。", memory: "zhou" },
  { speaker: "玩家", node: "show_key_to_zhou_memory", text: "所以后来我还是一直用？" },
  { speaker: "周砚川", character: "zhou", expression: "neutral", node: "show_key_to_zhou_memory", text: "嗯。因为找得到。" },
  { speaker: "周砚川", character: "zhou", expression: "embarrassed", node: "show_key_to_zhou_memory", text: "我只是希望你回家的时候少站一会儿。", done: () => {
    state.viewedZhouKeyMemory = true;
    state.askedZhouStory = true;
    addClue("周砚川版本：关系起点不是一句“他解决过一个问题”，而是一次门锁故障后的具体相处。");
  } },
];

const photoToLinMemoryLines = [
  { speaker: "玩家", node: "show_photo_to_lin_memory", text: "这张你认识吗？" },
  { speaker: "林夏", character: "lin", expression: "serious", node: "show_photo_to_lin_memory", text: "这张你居然还留着。" },
  { speaker: "玩家", node: "show_photo_to_lin_memory", text: "所以是你拍的？" },
  { speaker: "林夏", character: "lin", expression: "teasing", node: "show_photo_to_lin_memory", text: "嗯。严格来说，前半组是工作，后半组是我没忍住。" },
  { speaker: "林夏", character: "lin", expression: "teasing", node: "show_photo_to_lin_memory", text: "你那天的需求是去班味，但本人比班味还准时。" },
  { speaker: "回忆", node: "lin_photo_session_memory", text: "午后的街边橱窗反着光。你站在橱窗前，肩膀绷得很直。", memory: "lin" },
  { speaker: "林夏", character: "lin", expression: "teasing", node: "lin_photo_session_memory", text: "你备注写的是“去班味、生活化一点”。", memory: "lin" },
  { speaker: "玩家", node: "lin_photo_session_memory", text: "我已经尽量生活化了。", memory: "lin" },
  { speaker: "林夏", character: "lin", expression: "teasing", node: "lin_photo_session_memory", text: "你只是把手从“汇报工作”换成了“等待审批”。", memory: "lin" },
  { speaker: "玩家", node: "lin_photo_session_memory", text: "我有点不知道怎么摆。", memory: "lin" },
  { speaker: "林夏", character: "lin", expression: "serious", node: "lin_photo_session_memory", text: "别摆。你这样像机器人。", memory: "lin" },
  { speaker: "玩家", node: "lin_photo_session_memory", text: "你平时拍照都这么打击客户吗？", memory: "lin" },
  { speaker: "林夏", character: "lin", expression: "teasing", node: "lin_photo_session_memory", text: "不。我通常收费以后再打击。", memory: "lin" },
  { speaker: "回忆", node: "lin_photo_session_memory", text: "风从街口吹过来。帽子往下滑，你下意识伸手去按，头发也被吹乱。", memory: "lin" },
  { speaker: "玩家", node: "lin_photo_session_memory", text: "等一下，刚才不算。", memory: "lin" },
  { speaker: "林夏", character: "lin", expression: "serious", node: "lin_photo_session_memory", text: "前面那些能交付。", memory: "lin" },
  { speaker: "玩家", node: "lin_photo_session_memory", text: "这张呢？", memory: "lin" },
  { speaker: "林夏", character: "lin", expression: "teasing", node: "lin_photo_session_memory", text: "这张像你。", memory: "lin" },
  { speaker: "玩家", node: "show_photo_to_lin_memory", text: "后面这些呢？" },
  { speaker: "林夏", character: "lin", expression: "serious", node: "show_photo_to_lin_memory", text: "证据。" },
  { speaker: "玩家", node: "show_photo_to_lin_memory", text: "证明什么？" },
  { speaker: "林夏", character: "lin", expression: "serious", node: "show_photo_to_lin_memory", text: "证明你不用准备成另一个人，也值得被看见。" },
  { speaker: "林夏", character: "lin", expression: "teasing", node: "show_photo_to_lin_memory", text: "当然，也可能只是证明我职业素养不太稳定。", done: () => {
    state.viewedLinPhotoMemory = true;
    state.askedLinStory = true;
    addClue("林夏版本：关系起点来自一次“去班味”的生活化约拍，她记住的是玩家终于不像在证明自己的瞬间。");
  } },
];

const keyToLinLines = [
  { speaker: "玩家", node: "show_zhou_evidence_to_lin", text: "这个钥匙扣，你见过吗？" },
  { speaker: "林夏", character: "lin", expression: "serious", node: "show_zhou_evidence_to_lin", text: "没见过。" },
  { speaker: "玩家", node: "show_zhou_evidence_to_lin", text: "所以这是他编的？" },
  { speaker: "林夏", character: "lin", expression: "offended", node: "show_zhou_evidence_to_lin", text: "等一下，别急着给我递刀。" },
  { speaker: "玩家", node: "show_zhou_evidence_to_lin", text: "什么意思？" },
  { speaker: "林夏", character: "lin", expression: "teasing", node: "show_zhou_evidence_to_lin", text: "这个东西很像你会嫌丑，但最后又会一直用的东西。" },
  { speaker: "玩家", node: "show_zhou_evidence_to_lin", text: "你不是没见过？" },
  { speaker: "林夏", character: "lin", expression: "serious", node: "show_zhou_evidence_to_lin", text: "没见过，不代表不认识你。", done: () => {
    state.shownKeyToLin = true;
    addClue("林夏不认识钥匙扣，但能准确判断玩家对它的反应。");
  } },
];

const albumToZhouLines = [
  { speaker: "玩家", node: "show_lin_evidence_to_zhou", text: "这面照片墙，你见过吗？" },
  { speaker: "周砚川", character: "zhou", expression: "frown", node: "show_lin_evidence_to_zhou", text: "没有。" },
  { speaker: "玩家", node: "show_lin_evidence_to_zhou", text: "所以这是她编的？" },
  { speaker: "周砚川", character: "zhou", expression: "neutral", node: "show_lin_evidence_to_zhou", text: "照片不是假的。" },
  { speaker: "玩家", node: "show_lin_evidence_to_zhou", text: "你怎么判断？" },
  { speaker: "周砚川", character: "zhou", expression: "frown", node: "show_lin_evidence_to_zhou", text: "这些角度不像监控，也不像偷拍视频。" },
  { speaker: "玩家", node: "show_lin_evidence_to_zhou", text: "那像什么？" },
  { speaker: "周砚川", character: "zhou", expression: "embarrassed", node: "show_lin_evidence_to_zhou", text: "像拍照的人在等你放松。", done: () => {
    state.shownAlbumToZhou = true;
    addClue("周砚川不认识这面照片墙，但承认照片不像伪造，像拍照的人熟悉玩家放松下来的样子。");
  } },
];

const endingLines = [
  { speaker: "玩家", node: "ch02_010_chapter_end", text: "如果只是有人撒谎，为什么能留下这么多痕迹？" },
  { speaker: "周砚川", character: "zhou", expression: "neutral", node: "ch02_010_chapter_end", text: "所以不能只问人。" },
  { speaker: "林夏", character: "lin", expression: "serious", node: "ch02_010_chapter_end", text: "也不能只看物。物也会偏心。" },
  { speaker: "玩家", node: "ch02_010_chapter_end", text: "物怎么偏心？" },
  { speaker: "林夏", character: "lin", expression: "teasing", node: "ch02_010_chapter_end", text: "你看，钥匙偏他，照片偏我。" },
  { speaker: "周砚川", character: "zhou", expression: "frown", node: "ch02_010_chapter_end", text: "日历偏向冲突。" },
  { speaker: "404", node: "ch02_010_chapter_end", text: "第二章记录已归档。新增问题：两个故事的起点。" },
];

let currentLines = introLines;
let afterLinear = enterPresentMode;
let afterItemPopup = null;

const speaker = document.querySelector("#speaker");
const nodeLabel = document.querySelector("#node");
const dialogueText = document.querySelector("#dialogueText");
const dialoguePanel = document.querySelector(".dialogue-panel");
const chapterGoal = document.querySelector("#chapterGoal");
const questionGrid = document.querySelector("#questionGrid");
const questionHint = document.querySelector("#questionHint");
const phoneButton = document.querySelector('[data-action="phone"]');
const evidenceCount = document.querySelector("#evidenceCount");
const evidenceEmpty = document.querySelector("#evidenceEmpty");
const phoneModal = document.querySelector("#phoneModal");
const evidenceModal = document.querySelector("#evidenceModal");
const logModal = document.querySelector("#logModal");
const logList = document.querySelector("#logList");
const logEmpty = document.querySelector("#logEmpty");
const logCount = document.querySelector("#logCount");
const clueList = document.querySelector("#clueList");
const judgementRow = document.querySelector("#judgementRow");
const itemModal = document.querySelector("#itemModal");
const itemImage = document.querySelector("#itemImage");
const itemTitle = document.querySelector("#itemTitle");
const itemDesc = document.querySelector("#itemDesc");
const zhouPanel = document.querySelector("#zhouPanel");
const linPanel = document.querySelector("#linPanel");
const sceneCard = document.querySelector(".scene-card");
const roomHotspots = document.querySelector("#roomHotspots");
const detailHotspots = document.querySelector("#detailHotspots");
const roomPanControls = document.querySelector(".free-pan-controls");
const roomToast = document.querySelector("#roomToast");

const roomViewOrder = ["left", "center", "right"];
const roomGoalByView = {
  left: "书桌左侧",
  center: "照片墙和书架",
  right: "窗边和床铺",
};

renderLine(currentLines[0]);
setButtons([{ label: "点击继续", action: "continue" }]);

dialoguePanel.addEventListener("click", () => {
  if (state.mode === "linear") advanceLine();
});

document.querySelectorAll(".standee").forEach((standee) => {
  standee.addEventListener("click", () => {
    if (state.mode === "present") renderPresentCharacterOptions(standee.dataset.character);
    if (state.mode === "cross") renderCrossCharacterOptions(standee.dataset.character);
  });
  standee.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    if (state.mode === "present") renderPresentCharacterOptions(standee.dataset.character);
    if (state.mode === "cross") renderCrossCharacterOptions(standee.dataset.character);
  });
});

document.querySelector(".topbar").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.action === "phone") openPhone();
  if (button.dataset.action === "evidence") openEvidence();
  if (button.dataset.action === "log") openLog();
});

questionGrid.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button || button.disabled) return;
  recordChoice(button.textContent);
  handleAction(button.dataset.action);
});

roomHotspots.addEventListener("click", (event) => {
  const button = event.target.closest("[data-free-zone]");
  if (!button || state.mode !== "room") return;
  inspectRoom(button.dataset.freeZone);
});

roomPanControls.addEventListener("click", (event) => {
  const button = event.target.closest("[data-free-pan]");
  if (!button || state.mode !== "room") return;
  const currentIndex = roomViewOrder.indexOf(state.roomView);
  const nextIndex = button.dataset.freePan === "left" ? currentIndex - 1 : currentIndex + 1;
  setRoomView(roomViewOrder[Math.max(0, Math.min(roomViewOrder.length - 1, nextIndex))]);
});

detailHotspots.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button || state.mode !== "detail") return;
  if (button.dataset.detailAction === "collect") collectDetailEvidence();
  if (button.dataset.detailAction === "back") openRoomMode();
});

document.querySelectorAll(".evidence-card").forEach((card) => {
  card.addEventListener("click", () => {
    if (!state.evidence.has(card.dataset.evidence)) return;
    showItemPopup(card.dataset.evidence, () => {});
  });
});

judgementRow.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button || judgementRow.classList.contains("locked")) return;
  resolveDeduction(button.dataset.judge);
});

phoneModal.addEventListener("click", (event) => {
  const roomAction = event.target.closest("[data-phone-action='room']");
  if (roomAction) {
    closePhone();
    openRoomMode();
    return;
  }
  if (event.target === phoneModal) closePhone();
});

evidenceModal.addEventListener("click", (event) => {
  if (event.target === evidenceModal) closeEvidence();
});

logModal.addEventListener("click", (event) => {
  if (event.target === logModal) closeLog();
});

document.querySelector("#closeEvidence").addEventListener("click", closeEvidence);
document.querySelector("#closeLog").addEventListener("click", closeLog);
document.querySelector("#closePhone").addEventListener("click", closePhone);
document.querySelector("#closeItem").addEventListener("click", closeItem);

function handleAction(action) {
  if (action === "continue") advanceLine();
  if (action === "show_chat_zhou") startLinear(zhouChatLines, afterChatPresent);
  if (action === "show_chat_lin") startLinear(linChatLines, afterChatPresent);
  if (action === "open_room") openRoomMode();
  if (action === "room_back") enterCrossMode();
  if (action === "cross_back") enterCrossMode();
  if (action === "ask_zhou_story") startLinear(zhouStoryLines, afterCrossLine);
  if (action === "ask_lin_story") startLinear(linStoryLines, afterCrossLine);
  if (action === "show_key_zhou_memory") startLinear(keyToZhouMemoryLines, afterCrossLine);
  if (action === "show_photo_lin_memory") startLinear(photoToLinMemoryLines, afterCrossLine);
  if (action === "show_key_lin") startLinear(keyToLinLines, afterCrossLine);
  if (action === "show_album_zhou") startLinear(albumToZhouLines, afterCrossLine);
  if (action === "deduction") openEvidence();
  if (action === "restart_ch02") window.location.reload();
}

function advanceLine() {
  if (state.mode !== "linear") return;
  state.lineIndex += 1;
  if (state.lineIndex >= currentLines.length) {
    const callback = afterLinear;
    if (callback) callback();
    return;
  }
  renderLine(currentLines[state.lineIndex]);
}

function startLinear(lines, onDone) {
  state.mode = "linear";
  clearSceneModes();
  currentLines = lines;
  afterLinear = onDone;
  state.lineIndex = 0;
  renderLine(currentLines[0]);
  setButtons([{ label: "点击继续", action: "continue" }]);
}

function renderLine(line) {
  dialoguePanel.classList.remove("hidden");
  syncLineScene(line);
  speaker.textContent = line.speaker;
  nodeLabel.textContent = line.node || nodeForMode();
  dialogueText.textContent = line.text;
  setDialogueStandees();
  updateExpression(line);
  updateStandeeFocus(line.character || null);
  updateTopbarState();
  recordDialogueLine();
  if (line.done) line.done();
}

function setDialogueStandees() {
  zhouPanel.src = standeeAssets.zhou.neutral;
  linPanel.src = standeeAssets.lin.teasing;
  zhouPanel.dataset.expression = "neutral";
  linPanel.dataset.expression = "teasing";
}

function updateExpression(line) {
  if (!line.character) return;
  const panel = line.character === "zhou" ? zhouPanel : linPanel;
  const source = standeeAssets[line.character]?.[line.expression || "neutral"];
  if (source) panel.src = source;
}

function updateStandeeFocus(character) {
  zhouPanel.classList.toggle("active", character === "zhou" || state.selectedCharacter === "zhou");
  linPanel.classList.toggle("active", character === "lin" || state.selectedCharacter === "lin");
}

function updateTopbarState() {
  phoneButton.classList.toggle("attention", state.phoneUnlocked && (!state.evidence.has("album") || !state.evidence.has("calendar")));
}

function nodeForMode() {
  if (state.mode === "present") return "ch02_003_show_chat_snapshot";
  if (state.mode === "room") return "ch02_004_room_investigation_open";
  if (state.mode === "detail") return "ch02_detail_investigation";
  if (state.mode === "cross") return "ch02_008_story_question_loop";
  if (state.mode === "deduction") return "ch02_009_second_deduction";
  return "chapter_02";
}

function syncLineScene(line) {
  sceneCard.classList.remove("chapter2-memory-mode", "chapter2-memory-zhou", "chapter2-memory-lin");
  if (!line.memory) return;
  sceneCard.classList.add("chapter2-memory-mode", `chapter2-memory-${line.memory}`);
}

function enterPresentMode() {
  state.mode = "present";
  state.selectedCharacter = null;
  unlockEvidence("chat", false);
  clearSceneModes();
  sceneCard.classList.add("present-mode");
  chapterGoal.textContent = "展示聊天截图";
  renderLine({ speaker: "玩家", node: "ch02_003_show_chat_snapshot", text: "你准备先问谁？" });
  setButtons([], { showHint: false });
}

function renderPresentCharacterOptions(character) {
  state.selectedCharacter = character;
  const isZhou = character === "zhou";
  const name = isZhou ? "周砚川" : "林夏";
  if ((isZhou && state.shownChatToZhou) || (!isZhou && state.shownChatToLin)) {
    renderLine({ speaker: "玩家", node: "ch02_003_show_chat_snapshot", text: `${name}这边已经问过了。` });
    setButtons([], { showHint: false });
    return;
  }
  renderLine({ speaker: "玩家", node: "ch02_003_show_chat_snapshot", text: `先问${name}。` });
  setButtons([
    {
      label: `把聊天截图给${name}`,
      action: isZhou ? "show_chat_zhou" : "show_chat_lin",
      disabled: isZhou ? state.shownChatToZhou : state.shownChatToLin,
    },
  ]);
}

function afterChatPresent() {
  flushItemPopups(() => {
    if (state.shownChatToZhou && state.shownChatToLin) {
      state.phoneUnlocked = true;
      renderLine({ speaker: "玩家", node: "ch02_004_room_ready", text: "他们给出的解释完全不一样。房间里也许能查到外部证据。" });
      setButtons([{ label: "继续探索", action: "open_room" }]);
      updateTopbarState();
      return;
    }
    enterPresentMode();
  });
}

function openRoomMode() {
  state.mode = "room";
  state.selectedCharacter = null;
  state.detailTarget = null;
  clearSceneModes();
  sceneCard.classList.add("free-explore-scene", "free-room", `free-view-${state.roomView}`);
  chapterGoal.textContent = roomGoalByView[state.roomView];
  dialoguePanel.classList.add("hidden");
  hideRoomToast();
  setButtons([{ label: "回到交换证词", action: "room_back" }]);
  updateStandeeFocus(null);
}

function setRoomView(view) {
  state.roomView = view;
  clearSceneModes();
  sceneCard.classList.add("free-explore-scene", "free-room", `free-view-${view}`);
  chapterGoal.textContent = roomGoalByView[view];
  hideRoomToast();
}

function showRoomToast(text) {
  roomToast.textContent = text;
  roomToast.classList.remove("show");
  window.clearTimeout(state.roomToastTimer);
  void roomToast.offsetWidth;
  roomToast.classList.add("show");
  state.roomToastTimer = window.setTimeout(() => roomToast.classList.remove("show"), 5200);
}

function hideRoomToast() {
  roomToast.classList.remove("show");
  roomToast.textContent = "";
  window.clearTimeout(state.roomToastTimer);
}

function inspectRoom(hotspot) {
  if (hotspot === "shelf") {
    openDetailMode("calendar");
    return;
  }
  if (hotspot === "drawer") {
    openDetailMode("drawer");
    return;
  }
  if (hotspot === "album") {
    openDetailMode("album");
    return;
  }
  if (hotspot === "calendar") {
    openDetailMode("calendar");
    return;
  }
  if (hotspot === "window") {
    showRoomToast("窗边光线很亮，植物的影子落在床沿上。");
    return;
  }
  showRoomToast("床铺整理得很随意，像有人刚从很长的睡眠里坐起来。");
}

function openDetailMode(target) {
  state.mode = "detail";
  state.detailTarget = target;
  clearSceneModes();
  sceneCard.classList.add("free-explore-scene", "free-detail", `free-detail-${target}`);
  chapterGoal.textContent = "放大调查";
  const detailLines = {
    drawer: {
      node: "ch02_005_drawer_zoom",
      text: state.evidence.has("key")
        ? "抽屉里的钥匙和便签已经记录过。"
        : "抽屉拉开了。钥匙扣和便签压在同一个位置。",
    },
    album: {
      node: "ch02_006_album_zoom",
      text: state.evidence.has("album")
        ? "这面照片墙已经记录过。"
        : "墙上的拍立得和便签被夹在一起，摆拍和生活抓拍界线很轻。",
    },
    calendar: {
      node: "ch02_007_calendar_zoom",
      text: state.evidence.has("calendar")
        ? "同一晚两座城市的日历冲突已经记录过。"
        : "书架上的实体日历停在同一晚。两组手写标记挤在同一天。",
    },
  };
  dialoguePanel.classList.add("hidden");
  showRoomToast(detailLines[target].text);
  setButtons([], { showHint: false });
}

function collectDetailEvidence() {
  const target = state.detailTarget;
  const evidenceId = detailTargetToEvidence(target);
  if (!evidenceId) return;
  if (state.evidence.has(evidenceId)) {
    openRoomMode();
    return;
  }
  unlockEvidence(evidenceId);
  flushItemPopups(() => openRoomMode());
}

function detailTargetToEvidence(target) {
  return {
    drawer: "key",
    album: "album",
    calendar: "calendar",
  }[target];
}

function enterCrossMode() {
  const evidenceFound = ["key", "album", "calendar"].filter((id) => state.evidence.has(id)).length;
  const ready = evidenceFound >= 2;
  state.mode = "cross";
  state.selectedCharacter = null;
  chapterGoal.textContent = ready ? "交叉质询" : "继续调查";
  clearSceneModes();
  sceneCard.classList.add("cross-mode");
  renderLine({
    speaker: "玩家",
    node: "ch02_008_story_question_loop",
    text: ready ? "你准备先问谁？" : "房间里还有线索没看完。",
  });
  updateStandeeFocus(null);
  if (!ready) {
    setButtons([{ label: "继续探索", action: "open_room" }]);
    return;
  }
  renderCrossCharacterButtons();
}

function clearSceneModes() {
  sceneCard.classList.remove(
    "chapter2-room-mode",
    "chapter2-detail-mode",
    "chapter2-detail-drawer",
    "chapter2-detail-album",
    "chapter2-detail-calendar",
    "free-explore-scene",
    "free-room",
    "free-detail",
    "free-view-left",
    "free-view-center",
    "free-view-right",
    "free-detail-drawer",
    "free-detail-album",
    "free-detail-calendar",
    "chapter2-memory-mode",
    "chapter2-memory-zhou",
    "chapter2-memory-lin",
    "present-mode",
    "cross-mode"
  );
  hideRoomToast();
}

function renderCrossCharacterButtons() {
  setButtons([], { showHint: false });
}

function renderCrossCharacterOptions(character, returning = false) {
  state.selectedCharacter = character;
  const isZhou = character === "zhou";
  const name = isZhou ? "周砚川" : "林夏";
  renderLine({
    speaker: "玩家",
    node: "ch02_008_story_question_loop",
    text: returning ? `还要问${name}什么？` : `先问${name}。`,
  });
  updateStandeeFocus(character);
  if (isZhou) {
    setButtons([
      { label: "我们怎么认识的？", action: "ask_zhou_story", disabled: state.askedZhouStory },
      { label: "拿钥匙扣问他", action: "show_key_zhou_memory", disabled: !state.evidence.has("key") || state.viewedZhouKeyMemory },
      { label: "拿照片墙问他", action: "show_album_zhou", disabled: !state.evidence.has("album") || state.shownAlbumToZhou },
      { label: "换一个人问", action: "cross_back" },
    ]);
    return;
  }
  setButtons([
    { label: "我们怎么认识的？", action: "ask_lin_story", disabled: state.askedLinStory },
    { label: "拿拍立得问她", action: "show_photo_lin_memory", disabled: !state.evidence.has("album") || state.viewedLinPhotoMemory },
    { label: "拿钥匙扣问她", action: "show_key_lin", disabled: !state.evidence.has("key") || state.shownKeyToLin },
    { label: "换一个人问", action: "cross_back" },
  ]);
}

function afterCrossLine() {
  const readyForDeduction =
    state.evidence.has("key") &&
    state.evidence.has("album") &&
    state.evidence.has("calendar") &&
    state.askedZhouStory &&
    state.askedLinStory &&
    state.viewedZhouKeyMemory &&
    state.viewedLinPhotoMemory &&
    state.shownKeyToLin &&
    state.shownAlbumToZhou;
  if (readyForDeduction) {
    state.mode = "deduction";
    judgementRow.classList.remove("locked");
    chapterGoal.textContent = "第二次阶段判断";
    renderLine({ speaker: "玩家", node: "ch02_009_second_deduction", text: "为什么同一段关系有两个版本？" });
    setButtons([{ label: "打开证据做判断", action: "deduction" }]);
    return;
  }
  if (state.selectedCharacter) {
    renderCrossCharacterOptions(state.selectedCharacter, true);
    return;
  }
  enterCrossMode();
}

function resolveDeduction(judge) {
  if (state.deductionDone) return;
  state.deductionDone = true;
  const feedback = {
    zhou: [
      { speaker: "林夏", character: "lin", expression: "offended", node: "ch02_009_second_deduction", text: "又输给钥匙了。它最好真的很好用。" },
      { speaker: "周砚川", character: "zhou", expression: "embarrassed", node: "ch02_009_second_deduction", text: "它确实比较醒目。" },
    ],
    lin: [
      { speaker: "林夏", character: "lin", expression: "teasing", node: "ch02_009_second_deduction", text: "谢谢“生活抓拍”评审委员会。" },
      { speaker: "周砚川", character: "zhou", expression: "frown", node: "ch02_009_second_deduction", text: "证据仍然有冲突。" },
    ],
    info: [
      { speaker: "404", node: "ch02_009_second_deduction", text: "阶段判断已记录：存在信息利用可能。" },
      { speaker: "周砚川", character: "zhou", expression: "frown", node: "ch02_009_second_deduction", text: "需要继续排除。" },
      { speaker: "林夏", character: "lin", expression: "serious", node: "ch02_009_second_deduction", text: "这个说法听起来很吓人，但也不是没道理。" },
    ],
    split: [
      { speaker: "404", node: "ch02_009_second_deduction", text: "阶段判断已记录：故事版本异常。" },
      { speaker: "404", node: "ch02_009_second_deduction", text: "提示：这不是结论，只是一个更麻烦的问题。" },
      { speaker: "周砚川", character: "zhou", expression: "frown", node: "ch02_009_second_deduction", text: "继续查。" },
      { speaker: "林夏", character: "lin", expression: "serious", node: "ch02_009_second_deduction", text: "嗯。虽然我开始不喜欢这个方向了。" },
    ],
  };
  closeEvidence();
  startLinear([...feedback[judge], ...endingLines], finishChapter);
}

function finishChapter() {
  state.mode = "complete";
  chapterGoal.textContent = "第二章完成";
  renderLine({ speaker: "404", node: "chapter_02_complete", text: "第二章试玩段落结束。Chapter 03 已解锁。" });
  setButtons([{ label: "重新开始第二章", action: "restart_ch02" }]);
}

function openPhone() {
  if (!state.phoneUnlocked) {
    renderLine({ speaker: "404", node: "phone_locked", text: "先把聊天截图分别展示给两个人，再看手机。" });
    return;
  }
  phoneModal.classList.add("open");
  phoneModal.setAttribute("aria-hidden", "false");
}

function closePhone() {
  phoneModal.classList.remove("open");
  phoneModal.setAttribute("aria-hidden", "true");
}

function openEvidence() {
  evidenceModal.classList.add("open");
  evidenceModal.setAttribute("aria-hidden", "false");
}

function closeEvidence() {
  evidenceModal.classList.remove("open");
  evidenceModal.setAttribute("aria-hidden", "true");
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

function showItemPopup(id, onDone) {
  const item = evidenceItems[id];
  if (!item) {
    if (onDone) onDone();
    return;
  }
  hideRoomToast();
  itemImage.src = item.image;
  itemImage.alt = item.title;
  itemTitle.textContent = item.title;
  itemDesc.textContent = item.desc;
  afterItemPopup = onDone;
  itemModal.classList.add("open");
  itemModal.setAttribute("aria-hidden", "false");
}

function closeItem() {
  if (!itemModal.classList.contains("open")) return;
  itemModal.classList.remove("open");
  itemModal.setAttribute("aria-hidden", "true");
  const callback = afterItemPopup;
  afterItemPopup = null;
  if (callback) callback();
}

function flushItemPopups(onDone) {
  const id = state.itemQueue.shift();
  if (!id) {
    onDone();
    return;
  }
  showItemPopup(id, () => flushItemPopups(onDone));
}

function unlockEvidence(id, showPopup = true) {
  const before = state.evidence.size;
  state.evidence.add(id);
  const card = document.querySelector(`[data-evidence="${id}"]`);
  if (card) {
    card.classList.remove("locked");
    card.classList.add("unlocked");
  }
  evidenceCount.textContent = `${state.evidence.size}/4`;
  evidenceEmpty.classList.toggle("hidden", state.evidence.size > 0);
  if (state.evidence.size !== before) {
    addClue(evidenceClues[id]);
    if (showPopup) state.itemQueue.push(id);
  }
}

function addClue(text) {
  if (!text || state.clues.includes(text)) return;
  state.clues.push(text);
  clueList.innerHTML = "";
  state.clues.forEach((clue) => {
    const item = document.createElement("li");
    item.textContent = clue;
    clueList.appendChild(item);
  });
}

function setButtons(buttons, options = {}) {
  questionGrid.classList.remove("collapsed");
  questionGrid.innerHTML = "";
  if (!buttons.length) {
    questionGrid.classList.add("collapsed");
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
    node: nodeForMode(),
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

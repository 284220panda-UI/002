const state = {
  mode: "linear",
  lineIndex: 0,
  log: [],
  clues: [],
  evidence: new Set(),
  zhouUnderstandsLin: false,
  linUnderstandsZhou: false,
  finalChoice: "none",
  endingId: "none",
  finalChoiceConfirmed: false,
  unlockedMergeEnding: false,
};

const sceneCard = document.querySelector("#sceneCard");
const sceneImage = document.querySelector("#sceneImage");
const dialoguePanel = document.querySelector("#dialoguePanel");
const speaker = document.querySelector("#speaker");
const nodeLabel = document.querySelector("#node");
const dialogueText = document.querySelector("#dialogueText");
const nextCue = document.querySelector("#nextCue");
const questionGrid = document.querySelector("#questionGrid");
const choiceStack = document.querySelector(".choice-stack");
const testFeedbackPanel = document.querySelector("#testFeedbackPanel");
const evidenceModal = document.querySelector("#evidenceModal");
const logModal = document.querySelector("#logModal");
const phoneModal = document.querySelector("#phoneModal");
const confirmModal = document.querySelector("#confirmModal");
const confirmTitle = document.querySelector("#confirmTitle");
const confirmText = document.querySelector("#confirmText");
const confirmOk = document.querySelector("#confirmOk");
const evidenceCount = document.querySelector("#evidenceCount");
const evidenceEmpty = document.querySelector("#evidenceEmpty");
const clueList = document.querySelector("#clueList");
const logList = document.querySelector("#logList");
const logCount = document.querySelector("#logCount");
const logEmpty = document.querySelector("#logEmpty");
const phoneStatus = document.querySelector("#phoneStatus");
const phoneDetail = document.querySelector("#phoneDetail");
const phoneButton = document.querySelector('[data-action="phone"]');
const phoneContactEntry = document.querySelector("#phoneContactEntry");
const phoneContactsToggle = document.querySelector("#phoneContactsToggle");
const phoneContactSummary = document.querySelector("#phoneContactSummary");
const phoneContacts = document.querySelector("#phoneContacts");
const phoneAchievementsToggle = document.querySelector("#phoneAchievementsToggle");
const phoneAchievementEntry = document.querySelector("#phoneAchievementEntry");
const phoneAchievementSummary = document.querySelector("#phoneAchievementSummary");
const phoneAchievements = document.querySelector("#phoneAchievements");
const phoneAchievementGrid = document.querySelector("#phoneAchievementGrid");
const phoneAchievementPreview = document.querySelector("#phoneAchievementPreview");
const phoneAchievementImage = document.querySelector("#phoneAchievementImage");
const phoneAchievementName = document.querySelector("#phoneAchievementName");
const phoneAchievementDesc = document.querySelector("#phoneAchievementDesc");
const achievementProgress = document.querySelector("#achievementProgress");

if (sceneCard && choiceStack && choiceStack.parentElement !== sceneCard) {
  sceneCard.appendChild(choiceStack);
}

const achievementCard = document.createElement("aside");
achievementCard.className = "ending-achievement";
achievementCard.setAttribute("aria-live", "polite");
achievementCard.innerHTML = `
  <span>成就达成</span>
  <strong id="achievementTitle"></strong>
  <p id="achievementText"></p>
`;
sceneCard.appendChild(achievementCard);

const achievementTitle = achievementCard.querySelector("#achievementTitle");
const achievementText = achievementCard.querySelector("#achievementText");

let currentLines = [];
let afterLinear = null;
let pendingChoice = null;

const achievements = {
  ending_old_city: {
    title: "猫粮到位",
    text: "你选择留在熟悉的城市，也选择继续把它改成能呼吸的生活。",
  },
  ending_new_city: {
    title: "拍糊也行",
    text: "你选择去新城，也选择亲手建立新的路线和新的关系。",
  },
  ending_self: {
    title: "今日留白",
    text: "你暂时没有进入任何被安排好的未来，把重新出发的余地留给自己。",
  },
  ending_merge_try: {
    title: "全员到齐",
    text: "你看见两个世界都不完整，于是试着走向一个没有被提前写好的地方。",
  },
};

const assets = {
  overlap: "./assets/chapter5/ch05_overlap_room_game.webp",
  zhouReadsLin: "./assets/chapter5/ch05_zhou_reads_lin_life_game.webp",
  linReadsZhou: "./assets/chapter5/ch05_lin_reads_zhou_life_game.webp",
  finalWords: "./assets/chapter5/ch05_overlap_room_game.webp",
  finalChoiceBoard: "./assets/chapter5/ch05_final_choice_board_blank_game.webp",
  farewellLin: "./assets/chapter5/ch05_farewell_lin_old_city_game.webp",
  farewellZhou: "./assets/chapter5/ch05_farewell_zhou_new_city_game.webp",
  oldCity: "./assets/chapter5/ch05_ending_old_city_game.webp",
  newCity: "./assets/chapter5/ch05_ending_new_city_game.webp",
  selfRoom: "./assets/chapter5/ch05_ending_self_game.webp?v=20260815-self-v2",
  selfCalendar: "./assets/chapter5/ch05_self_empty_calendar_game.webp",
  mergeTry: "./assets/chapter5/ch05_ending_merge_try_game.webp",
  mergeUnchanged: "./assets/chapter5/ch05_merge_unchanged_world_game.webp",
  mergeReunion: "./assets/chapter5/ch05_merge_reunion_game.webp",
};

const achievementStorageKey = "project002_unlocked_endings";
const friendRequestsStorageKey = "project002_self_friend_requests";
const friendRequestsSeenStorageKey = "project002_self_friend_requests_seen";

const evidenceItems = {
  missing: "E012 两种生活的缺页",
  zhouReads: "周砚川理解林夏",
  linReads: "林夏理解周砚川",
  finalChoice: "最终选择板",
};

const introLines = [
  { speaker: "回忆", node: "ch05_001_missing_pages_reopen", text: "两份生活记录并排摊开。", image: assets.overlap },
  { speaker: "回忆", node: "ch05_001_missing_pages_reopen", text: "老城那一份夹着露营照片和小猫检查单。", image: assets.overlap },
  { speaker: "回忆", node: "ch05_001_missing_pages_reopen", text: "新城那一份夹着海边照片和新城临时生活地图。", image: assets.overlap },
  { speaker: "回忆", node: "ch05_001_missing_pages_reopen", text: "缺页的位置越来越明显。", image: assets.overlap },
  { speaker: "回忆", node: "ch05_001_missing_pages_reopen", text: "像有人把最能让你动摇的部分留下，把最难熬的部分抽走。", image: assets.overlap },
  { speaker: "回忆", node: "ch05_001_missing_pages_reopen", text: "周砚川看着那些缺页，第一次没有立刻给出判断。", image: assets.overlap },
  { speaker: "回忆", node: "ch05_001_missing_pages_reopen", text: "林夏伸手碰了一下海边照片，指尖穿过照片边缘，像碰到一层很薄的水。", image: assets.overlap },
  { speaker: "玩家", node: "ch05_001_missing_pages_reopen", text: "如果这个世界真的撑不住了，你们会去哪？", image: assets.overlap },
  { speaker: "回忆", node: "ch05_001_missing_pages_reopen", text: "没有人回答。", image: assets.overlap },
  { speaker: "周砚川", node: "ch05_001_missing_pages_reopen", text: "不知道。", image: assets.overlap },
  { speaker: "林夏", node: "ch05_001_missing_pages_reopen", text: "这次我也没有能糊弄过去的答案。", image: assets.overlap },
  { speaker: "回忆", node: "ch05_001_missing_pages_reopen", text: "你忽然意识到，最后选择不只是在决定自己去哪。", image: assets.overlap },
  { speaker: "回忆", node: "ch05_001_missing_pages_reopen", text: "也可能是在决定，哪一种生活会彻底退回看不见的地方。", image: assets.overlap },
  { speaker: "404", node: "ch05_001_missing_pages_reopen", text: "界面记录：Chapter 05：最后选择。", image: assets.overlap },
];

const overlapLines = [
  { speaker: "回忆", node: "ch05_002_world_overlap_room", text: "房间开始变得拥挤。", image: assets.overlap },
  { speaker: "回忆", node: "ch05_002_world_overlap_room", text: "书桌边出现老城露营的营地灯。", image: assets.overlap },
  { speaker: "回忆", node: "ch05_002_world_overlap_room", text: "门口多了小猫纸箱。", image: assets.overlap },
  { speaker: "回忆", node: "ch05_002_world_overlap_room", text: "墙上贴着新城小公寓的冰箱贴。", image: assets.overlap },
  { speaker: "回忆", node: "ch05_002_world_overlap_room", text: "照片墙里多出一张海边照片，林夏站在浅水里回头笑。", image: assets.overlap },
  { speaker: "回忆", node: "ch05_002_world_overlap_room", text: "桌面上摊着新城生活地图，旁边压着老城通勤卡。", image: assets.overlap },
  { speaker: "回忆", node: "ch05_002_world_overlap_room", text: "这些东西都不像假的。它们只是不能同时属于同一个现在。", image: assets.overlap },
];

const zhouReadsLinLines = [
  { speaker: "回忆", node: "ch05_003_zhou_reads_lin_life", text: "周砚川拿起那张新城临时生活地图。", image: assets.zhouReadsLin },
  { speaker: "回忆", node: "ch05_003_zhou_reads_lin_life", text: "上面贴着小公寓地址、晚饭、药店、施工噪音和夜间路线。", image: assets.zhouReadsLin },
  { speaker: "周砚川", node: "ch05_003_zhou_reads_lin_life", text: "这张地图做得很实用。", image: assets.zhouReadsLin },
  { speaker: "林夏", node: "ch05_003_zhou_reads_lin_life", text: "哇，得到工程师认证了。", image: assets.zhouReadsLin },
  { speaker: "周砚川", node: "ch05_003_zhou_reads_lin_life", text: "夜间路线最好再标一个备用出口。", image: assets.zhouReadsLin },
  { speaker: "林夏", node: "ch05_003_zhou_reads_lin_life", text: "你看，你已经开始给我的生活提优化建议了。", image: assets.zhouReadsLin },
  { speaker: "周砚川", node: "ch05_003_zhou_reads_lin_life", text: "不是你的生活。", image: assets.zhouReadsLin },
  { speaker: "回忆", node: "ch05_003_zhou_reads_lin_life", text: "周砚川停了一下。", image: assets.zhouReadsLin },
  { speaker: "周砚川", node: "ch05_003_zhou_reads_lin_life", text: "是你们共同的生活。", image: assets.zhouReadsLin },
  { speaker: "回忆", node: "ch05_003_zhou_reads_lin_life", text: "林夏没有立刻接话。", image: assets.zhouReadsLin },
  { speaker: "回忆", node: "ch05_003_zhou_reads_lin_life", text: "周砚川翻到下一页。", image: assets.zhouReadsLin },
  { speaker: "回忆", node: "ch05_003_zhou_reads_lin_life", text: "海边照片夹在生活地图后面，照片里的林夏正回头笑，冰淇淋快要化到手指上。", image: assets.zhouReadsLin },
  { speaker: "周砚川", node: "ch05_003_zhou_reads_lin_life", text: "这张照片不是你拍的。", image: assets.zhouReadsLin },
  { speaker: "林夏", node: "ch05_003_zhou_reads_lin_life", text: "嗯。是她拍的。", image: assets.zhouReadsLin },
  { speaker: "周砚川", node: "ch05_003_zhou_reads_lin_life", text: "她在那个世界里，不只是被你带着走。", image: assets.zhouReadsLin },
  { speaker: "林夏", node: "ch05_003_zhou_reads_lin_life", text: "当然。", image: assets.zhouReadsLin },
  { speaker: "林夏", node: "ch05_003_zhou_reads_lin_life", text: "她也会把我拍得很狼狈。", image: assets.zhouReadsLin },
  { speaker: "周砚川", node: "ch05_003_zhou_reads_lin_life", text: "这很好。", image: assets.zhouReadsLin },
  { speaker: "林夏", node: "ch05_003_zhou_reads_lin_life", text: "你对“好”的定义还挺特别。", image: assets.zhouReadsLin },
  { speaker: "周砚川", node: "ch05_003_zhou_reads_lin_life", text: "说明她开始参与那里的生活。", image: assets.zhouReadsLin },
  { speaker: "回忆", node: "ch05_003_zhou_reads_lin_life", text: "他把照片放回地图旁边。", image: assets.zhouReadsLin },
  { speaker: "周砚川", node: "ch05_003_zhou_reads_lin_life", text: "这比“别怕”有用。", image: assets.zhouReadsLin },
  { speaker: "林夏", node: "ch05_003_zhou_reads_lin_life", text: "你夸人也像验收。", image: assets.zhouReadsLin },
  { speaker: "周砚川", node: "ch05_003_zhou_reads_lin_life", text: "我在说事实。", image: assets.zhouReadsLin },
  { speaker: "林夏", node: "ch05_003_zhou_reads_lin_life", text: "好吧。这个事实我收下。", image: assets.zhouReadsLin },
];

const linReadsZhouLines = [
  { speaker: "回忆", node: "ch05_004_lin_reads_zhou_life", text: "林夏翻到老城生活记录。", image: assets.linReadsZhou },
  { speaker: "回忆", node: "ch05_004_lin_reads_zhou_life", text: "露营照片边上夹着小猫检查单，下面有一行字：周一早上，旧压力仍然回来。", image: assets.linReadsZhou },
  { speaker: "林夏", node: "ch05_004_lin_reads_zhou_life", text: "你这个人，连喜欢都很像长期维护。", image: assets.linReadsZhou },
  { speaker: "周砚川", node: "ch05_004_lin_reads_zhou_life", text: "这句话听起来不像夸奖。", image: assets.linReadsZhou },
  { speaker: "林夏", node: "ch05_004_lin_reads_zhou_life", text: "也不算骂。", image: assets.linReadsZhou },
  { speaker: "林夏", node: "ch05_004_lin_reads_zhou_life", text: "你给她留了很多能喘气的地方。", image: assets.linReadsZhou },
  { speaker: "林夏", node: "ch05_004_lin_reads_zhou_life", text: "朋友、露营、小猫，还有那个听起来很麻烦但确实有用的备用计划。", image: assets.linReadsZhou },
  { speaker: "周砚川", node: "ch05_004_lin_reads_zhou_life", text: "老城也会让她烦。", image: assets.linReadsZhou },
  { speaker: "林夏", node: "ch05_004_lin_reads_zhou_life", text: "我知道。所以你没有骗她说留下就会万事大吉。", image: assets.linReadsZhou },
  { speaker: "回忆", node: "ch05_004_lin_reads_zhou_life", text: "林夏把小猫检查单放回原位。", image: assets.linReadsZhou },
  { speaker: "林夏", node: "ch05_004_lin_reads_zhou_life", text: "不过我有一个优化建议。", image: assets.linReadsZhou },
  { speaker: "周砚川", node: "ch05_004_lin_reads_zhou_life", text: "你说。", image: assets.linReadsZhou },
  { speaker: "林夏", node: "ch05_004_lin_reads_zhou_life", text: "别把所有“为她好”都写成计划。偶尔也要让生活乱一点。", image: assets.linReadsZhou },
  { speaker: "周砚川", node: "ch05_004_lin_reads_zhou_life", text: "比如？", image: assets.linReadsZhou },
  { speaker: "林夏", node: "ch05_004_lin_reads_zhou_life", text: "比如哪天晚上直接带她出发去看日落。", image: assets.linReadsZhou },
  { speaker: "周砚川", node: "ch05_004_lin_reads_zhou_life", text: "可以。", image: assets.linReadsZhou },
  { speaker: "回忆", node: "ch05_004_lin_reads_zhou_life", text: "她又看了一眼露营照片。", image: assets.linReadsZhou },
  { speaker: "回忆", node: "ch05_004_lin_reads_zhou_life", text: "照片里朋友们围在一起，营地灯压住野餐垫的边角，玩家的手机拍得有一点糊。", image: assets.linReadsZhou },
  { speaker: "林夏", node: "ch05_004_lin_reads_zhou_life", text: "而且她在这里不是只有你。", image: assets.linReadsZhou },
  { speaker: "周砚川", node: "ch05_004_lin_reads_zhou_life", text: "嗯。", image: assets.linReadsZhou },
  { speaker: "林夏", node: "ch05_004_lin_reads_zhou_life", text: "朋友、楼下、那只猫，还有一堆麻烦但真实的小事。", image: assets.linReadsZhou },
  { speaker: "林夏", node: "ch05_004_lin_reads_zhou_life", text: "这点挺厉害的。", image: assets.linReadsZhou },
  { speaker: "周砚川", node: "ch05_004_lin_reads_zhou_life", text: "哪里厉害？", image: assets.linReadsZhou },
  { speaker: "林夏", node: "ch05_004_lin_reads_zhou_life", text: "她不用从零开始证明自己属于这里。", image: assets.linReadsZhou },
  { speaker: "回忆", node: "ch05_004_lin_reads_zhou_life", text: "周砚川垂下眼，看着那张照片。", image: assets.linReadsZhou },
  { speaker: "周砚川", node: "ch05_004_lin_reads_zhou_life", text: "但这里也会让她累。", image: assets.linReadsZhou },
  { speaker: "林夏", node: "ch05_004_lin_reads_zhou_life", text: "我知道。", image: assets.linReadsZhou },
];

const mutualLines = [
  { speaker: "林夏", node: "ch05_005_mutual_understanding", text: "所以我们都不是突然冒出来的人。", image: assets.finalWords },
  { speaker: "周砚川", node: "ch05_005_mutual_understanding", text: "不是。", image: assets.finalWords },
  { speaker: "林夏", node: "ch05_005_mutual_understanding", text: "也不是谁比较真。", image: assets.finalWords },
  { speaker: "周砚川", node: "ch05_005_mutual_understanding", text: "至少现在的证据不是。", image: assets.finalWords },
  { speaker: "回忆", node: "ch05_005_mutual_understanding", text: "林夏看向周砚川。", image: assets.finalWords },
  { speaker: "林夏", node: "ch05_005_mutual_understanding", text: "你是真的在那个世界里爱她。", image: assets.finalWords },
  { speaker: "周砚川", node: "ch05_005_mutual_understanding", text: "你也是。", image: assets.finalWords },
  { speaker: "回忆", node: "ch05_005_mutual_understanding", text: "这句话说完，房间反而安静下来。", image: assets.finalWords },
  { speaker: "回忆", node: "ch05_005_mutual_understanding", text: "不是竞争结束了。是他们终于明白，对方也不是谎言。", image: assets.finalWords },
];

const finalWordsLines = [
  { speaker: "周砚川", node: "ch05_006_final_words", text: "我不会说留下比较好。", image: assets.finalWords },
  { speaker: "周砚川", node: "ch05_006_final_words", text: "如果你留下，我会和你继续改。", image: assets.finalWords },
  { speaker: "周砚川", node: "ch05_006_final_words", text: "如果你走，我希望你别怕冒险。", image: assets.finalWords },
  { speaker: "林夏", node: "ch05_006_final_words", text: "我也不说出发比较好。", image: assets.finalWords },
  { speaker: "林夏", node: "ch05_006_final_words", text: "如果你去新城，我陪你慢慢熟悉。", image: assets.finalWords },
  { speaker: "林夏", node: "ch05_006_final_words", text: "如果你留下，我希望你享受幸福。", image: assets.finalWords },
  { speaker: "回忆", node: "ch05_006_final_words", text: "他们都没有再往前一步。", image: assets.finalWords },
  { speaker: "回忆", node: "ch05_006_final_words", text: "选择终于回到你手里。", image: assets.finalWords },
];

const oldCityEnding = [
  { speaker: "回忆", node: "ch05_farewell_lin_old_city", text: "房间里的新城地图开始变淡。", image: assets.farewellLin },
  { speaker: "回忆", node: "ch05_farewell_lin_old_city", text: "林夏伸手按住地图边角，像是下意识不想让它这么快消失。", image: assets.farewellLin },
  { speaker: "林夏", node: "ch05_farewell_lin_old_city", text: "所以，是老城。", image: assets.farewellLin },
  { speaker: "玩家", node: "ch05_farewell_lin_old_city", text: "嗯。", image: assets.farewellLin },
  { speaker: "回忆", node: "ch05_farewell_lin_old_city", text: "林夏沉默了一会儿，把相机从脖子上摘下来，递给你。", image: assets.farewellLin },
  { speaker: "林夏", node: "ch05_farewell_lin_old_city", text: "那你答应我一件事。", image: assets.farewellLin },
  { speaker: "玩家", node: "ch05_farewell_lin_old_city", text: "什么？", image: assets.farewellLin },
  { speaker: "林夏", node: "ch05_farewell_lin_old_city", text: "别把这里过成“只是没走成”。", image: assets.farewellLin },
  { speaker: "林夏", node: "ch05_farewell_lin_old_city", text: "要是你哪天在老城也看见很好玩的光，就拍下来。", image: assets.farewellLin },
  { speaker: "回忆", node: "ch05_farewell_lin_old_city", text: "你接过相机。", image: assets.farewellLin },
  { speaker: "回忆", node: "ch05_farewell_lin_old_city", text: "她笑了一下，眼眶却很亮。", image: assets.farewellLin },
  { speaker: "林夏", node: "ch05_farewell_lin_old_city", text: "我会有点不甘心。", image: assets.farewellLin },
  { speaker: "林夏", node: "ch05_farewell_lin_old_city", text: "但我知道你不是没有想过我。", image: assets.farewellLin },
  { speaker: "回忆", node: "ending_old_city", text: "清晨，小区楼下。", image: assets.oldCity },
  { speaker: "回忆", node: "ending_old_city", text: "小猫纸箱旁边多了一袋猫粮。", image: assets.oldCity },
  { speaker: "回忆", node: "ending_old_city", text: "周砚川蹲下检查纸箱里的毛巾有没有潮。", image: assets.oldCity },
  { speaker: "玩家", node: "ending_old_city", text: "先去医院？", image: assets.oldCity },
  { speaker: "周砚川", node: "ending_old_city", text: "嗯。", image: assets.oldCity },
  { speaker: "周砚川", node: "ending_old_city", text: "然后回来把阳台收一下。", image: assets.oldCity },
  { speaker: "玩家", node: "ending_old_city", text: "已经开始计划了？", image: assets.oldCity },
  { speaker: "周砚川", node: "ending_old_city", text: "只计划今天。", image: assets.oldCity },
  { speaker: "回忆", node: "ending_old_city", text: "你看了一眼熟悉的小区门口。", image: assets.oldCity },
  { speaker: "回忆", node: "ending_old_city", text: "它没有变成全新的地方。", image: assets.oldCity },
  { speaker: "回忆", node: "ending_old_city", text: "但你知道，今天不是原样重复。", image: assets.oldCity },
];

const newCityEnding = [
  { speaker: "回忆", node: "ch05_farewell_zhou_new_city", text: "房间里的露营灯慢慢暗下来。", image: assets.farewellZhou },
  { speaker: "回忆", node: "ch05_farewell_zhou_new_city", text: "周砚川把小猫检查单夹回记录本里，动作比平时慢一点。", image: assets.farewellZhou },
  { speaker: "周砚川", node: "ch05_farewell_zhou_new_city", text: "你决定了。", image: assets.farewellZhou },
  { speaker: "玩家", node: "ch05_farewell_zhou_new_city", text: "嗯。", image: assets.farewellZhou },
  { speaker: "回忆", node: "ch05_farewell_zhou_new_city", text: "他点了点头，没有立刻说话。", image: assets.farewellZhou },
  { speaker: "周砚川", node: "ch05_farewell_zhou_new_city", text: "那到新城以后，别因为陌生就硬撑。", image: assets.farewellZhou },
  { speaker: "玩家", node: "ch05_farewell_zhou_new_city", text: "你这是临走还要叮嘱？", image: assets.farewellZhou },
  { speaker: "周砚川", node: "ch05_farewell_zhou_new_city", text: "不是叮嘱。", image: assets.farewellZhou },
  { speaker: "周砚川", node: "ch05_farewell_zhou_new_city", text: "是我能留给你的，只有这些。", image: assets.farewellZhou },
  { speaker: "回忆", node: "ch05_farewell_zhou_new_city", text: "他把那张小猫的照片递给你。", image: assets.farewellZhou },
  { speaker: "周砚川", node: "ch05_farewell_zhou_new_city", text: "如果有一天你也在那边遇到想照顾的东西。", image: assets.farewellZhou },
  { speaker: "周砚川", node: "ch05_farewell_zhou_new_city", text: "不要因为它麻烦，就先放弃。", image: assets.farewellZhou },
  { speaker: "玩家", node: "ch05_farewell_zhou_new_city", text: "你会生气吗？", image: assets.farewellZhou },
  { speaker: "周砚川", node: "ch05_farewell_zhou_new_city", text: "会。", image: assets.farewellZhou },
  { speaker: "回忆", node: "ch05_farewell_zhou_new_city", text: "他说得很平静。", image: assets.farewellZhou },
  { speaker: "周砚川", node: "ch05_farewell_zhou_new_city", text: "但我知道，你不是为了离开我才走。", image: assets.farewellZhou },
  { speaker: "回忆", node: "ending_new_city", text: "新城小公寓。", image: assets.newCity },
  { speaker: "回忆", node: "ending_new_city", text: "生活地图旁边贴着海边照片，冰箱贴下面压着一张活动报名确认。", image: assets.newCity },
  { speaker: "林夏", node: "ending_new_city", text: "你真的报了？", image: assets.newCity },
  { speaker: "玩家", node: "ending_new_city", text: "嗯。", image: assets.newCity },
  { speaker: "林夏", node: "ending_new_city", text: "新城周末手作市集志愿者。这个听起来很像会被迫认识很多人。", image: assets.newCity },
  { speaker: "玩家", node: "ending_new_city", text: "所以我才报。", image: assets.newCity },
  { speaker: "回忆", node: "ending_new_city", text: "林夏把相机背到肩上，故意压低声音。", image: assets.newCity },
  { speaker: "林夏", node: "ending_new_city", text: "采访一下，建立新社交圈是什么感觉？", image: assets.newCity },
  { speaker: "玩家", node: "ending_new_city", text: "有点麻烦。", image: assets.newCity },
  { speaker: "林夏", node: "ending_new_city", text: "还有呢？", image: assets.newCity },
  { speaker: "玩家", node: "ending_new_city", text: "也有点期待。", image: assets.newCity },
  { speaker: "回忆", node: "ending_new_city", text: "楼下有人在群里发集合位置。", image: assets.newCity },
  { speaker: "回忆", node: "ending_new_city", text: "你看了一眼生活地图，在小公寓和海边之间，又标了一个新的点。", image: assets.newCity },
  { speaker: "回忆", node: "ending_new_city", text: "窗外是还没用熟的新城。", image: assets.newCity },
  { speaker: "回忆", node: "ending_new_city", text: "但地图上已经不只有路线，也开始有你认识的人。", image: assets.newCity },
];

const selfEnding = [
  { speaker: "回忆", node: "ending_self", text: "房间慢慢恢复到最初的样子。", image: assets.selfRoom },
  { speaker: "回忆", node: "ending_self", text: "露营灯、海边照片、小猫纸箱、新城地图都变成浅浅的痕迹。", image: assets.selfRoom },
  { speaker: "周砚川", node: "ending_self", text: "这也是选择。", image: assets.selfRoom },
  { speaker: "林夏", node: "ending_self", text: "嗯。不是逃跑。", image: assets.selfRoom },
  { speaker: "回忆", node: "ending_self", text: "她说得很快，像怕慢一点就说不出口。", image: assets.selfRoom },
  { speaker: "回忆", node: "ending_self", text: "你看着桌上那张空白页。", image: assets.selfRoom },
  { speaker: "回忆", node: "ending_self", text: "刚才每一个结局都很真实。", image: assets.selfRoom },
  { speaker: "回忆", node: "ending_self", text: "老城有你熟悉的人、街道和责任。新城有你想去的地方、还没建立起来的生活。", image: assets.selfRoom },
  { speaker: "回忆", node: "ending_self", text: "它们都不是错的。", image: assets.selfRoom },
  { speaker: "回忆", node: "ending_self", text: "但你突然意识到，你现在最想要的不是立刻选中哪一种未来。", image: assets.selfRoom },
  { speaker: "回忆", node: "ending_self", text: "你想先停下来。", image: assets.selfRoom },
  { speaker: "回忆", node: "ending_self", text: "想在没有任何人替你写好答案的时候，听清楚自己到底想去哪里。", image: assets.selfRoom },
  { speaker: "玩家", node: "ending_self", text: "那你们呢？", image: assets.selfRoom },
  { speaker: "回忆", node: "ending_self", text: "周砚川看向正在变淡的小猫纸箱。", image: assets.selfRoom },
  { speaker: "回忆", node: "ending_self", text: "林夏低头看着手里的相机，屏幕已经没有画面。", image: assets.selfRoom },
  { speaker: "周砚川", node: "ending_self", text: "不知道。", image: assets.selfRoom },
  { speaker: "林夏", node: "ending_self", text: "也许回到我们各自的世界。", image: assets.selfRoom },
  { speaker: "周砚川", node: "ending_self", text: "也许只是变成你记得的一部分。", image: assets.selfRoom },
  { speaker: "林夏", node: "ending_self", text: "这个说法听起来很亏。", image: assets.selfRoom },
  { speaker: "回忆", node: "ending_self", text: "她抬起头，笑了一下，但眼眶有点红。", image: assets.selfRoom },
  { speaker: "林夏", node: "ending_self", text: "那以后呢？", image: assets.selfRoom },
  { speaker: "玩家", node: "ending_self", text: "什么以后？", image: assets.selfRoom },
  { speaker: "林夏", node: "ending_self", text: "我是说，等你想明白以后。", image: assets.selfRoom },
  { speaker: "林夏", node: "ending_self", text: "我们还会再见吗？", image: assets.selfRoom },
  { speaker: "回忆", node: "ending_self", text: "周砚川没有立刻看你。过了一会儿，他才说。", image: assets.selfRoom },
  { speaker: "周砚川", node: "ending_self", text: "如果有一天你想重新出发。", image: assets.selfRoom },
  { speaker: "周砚川", node: "ending_self", text: "我希望那不是因为你被哪个世界推着走。", image: assets.selfRoom },
  { speaker: "玩家", node: "ending_self", text: "我也是。", image: assets.selfRoom },
  { speaker: "回忆", node: "ending_self", text: "你没有办法保证一定会再见。", image: assets.selfRoom },
  { speaker: "回忆", node: "ending_self", text: "但你希望，如果真的还有下一次见面，那会是你想清楚之后，自己走过去的。", image: assets.selfRoom },
  { speaker: "回忆", node: "ending_self", text: "你没有否认他们。", image: assets.selfRoom },
  { speaker: "回忆", node: "ending_self", text: "也没有把自己交给任何一个已经被摆好的未来。", image: assets.selfRoom },
  { speaker: "回忆", node: "ending_self", text: "第二天早上，手机日历空出一整天。", image: assets.selfCalendar },
  { speaker: "回忆", node: "ending_self", text: "你第一次没有急着填满它。", image: assets.selfCalendar },
  { speaker: "回忆", node: "ending_self", text: "你把它留在那里。像给自己留下一次重新出发的余地。", image: assets.selfCalendar },
  { speaker: "回忆", node: "ending_self_friend_requests", text: "手机屏幕忽然亮了一下。不是日历提醒。", image: assets.selfCalendar, unlockFriendRequests: true },
  { speaker: "回忆", node: "ending_self_friend_requests", text: "通讯录图标右上角，多了一个红点。", image: assets.selfCalendar },
  { speaker: "回忆", node: "ending_self_friend_requests", text: "新的好友申请安静地停在那里。", image: assets.selfCalendar },
  { speaker: "404", node: "ending_self_friend_requests", text: "提示：打开手机，查看新的联系人申请。", image: assets.selfCalendar },
  { speaker: "回忆", node: "ending_self_friend_requests", text: "没有立刻点接受。", image: assets.selfCalendar },
  { speaker: "回忆", node: "ending_self_friend_requests", text: "也没有划掉。", image: assets.selfCalendar },
  { speaker: "回忆", node: "ending_self_friend_requests", text: "空白的一天，忽然有了两个很轻的入口。", image: assets.selfCalendar },
];

const mergeEnding = [
  { speaker: "回忆", node: "ending_merge_try", text: "你没有把任何一份生活记录合上。", image: assets.mergeTry },
  { speaker: "回忆", node: "ending_merge_try", text: "老城通勤卡和新城生活地图被放在同一页。", image: assets.mergeTry },
  { speaker: "回忆", node: "ending_merge_try", text: "世界没有立刻稳定。", image: assets.mergeTry },
  { speaker: "回忆", node: "ending_merge_try", text: "墙上的照片一张一张闪烁，像还没决定要留下哪一种光。", image: assets.mergeTry },
  { speaker: "周砚川", node: "ending_merge_try", text: "如果可以合并，那为什么不是选择其中一个？", image: assets.mergeTry },
  { speaker: "林夏", node: "ending_merge_try", text: "对啊。", image: assets.mergeTry },
  { speaker: "林夏", node: "ending_merge_try", text: "你明明可以选我。", image: assets.mergeTry },
  { speaker: "回忆", node: "ending_merge_try", text: "她说完才像意识到这句话太直白，偏过头笑了一下。", image: assets.mergeTry },
  { speaker: "林夏", node: "ending_merge_try", text: "好吧，我承认，我就是会这么想。", image: assets.mergeTry },
  { speaker: "回忆", node: "ending_merge_try", text: "周砚川看着桌上的两份生活记录。", image: assets.mergeTry },
  { speaker: "周砚川", node: "ending_merge_try", text: "我也会。", image: assets.mergeTry },
  { speaker: "周砚川", node: "ending_merge_try", text: "我会想，是不是我给你的生活还不够好。", image: assets.mergeTry },
  { speaker: "玩家", node: "ending_merge_try", text: "不是。", image: assets.mergeTry },
  { speaker: "回忆", node: "ending_merge_try", text: "房间安静下来。", image: assets.mergeTry },
  { speaker: "回忆", node: "ending_merge_try", text: "老城的灯光和新城的海风同时从窗边掠过，又同时消失。", image: assets.mergeTry },
  { speaker: "林夏", node: "ending_merge_try", text: "这条路看起来很麻烦。", image: assets.mergeTry },
  { speaker: "周砚川", node: "ending_merge_try", text: "是。", image: assets.mergeTry },
  { speaker: "林夏", node: "ending_merge_try", text: "你居然不反对？", image: assets.mergeTry },
  { speaker: "周砚川", node: "ending_merge_try", text: "我反对无代价的合并。", image: assets.mergeTry },
  { speaker: "周砚川", node: "ending_merge_try", text: "但如果她知道代价，还要试。", image: assets.mergeTry },
  { speaker: "回忆", node: "ending_merge_try", text: "林夏看向你，声音低了一点。", image: assets.mergeTry },
  { speaker: "林夏", node: "ending_merge_try", text: "我还是会不甘心。", image: assets.mergeTry },
  { speaker: "林夏", node: "ending_merge_try", text: "但如果这是你希望的。", image: assets.mergeTry },
  { speaker: "林夏", node: "ending_merge_try", text: "那就一起试。", image: assets.mergeTry },
  { speaker: "周砚川", node: "ending_merge_try", text: "不是把两个世界硬塞在一起。", image: assets.mergeTry },
  { speaker: "周砚川", node: "ending_merge_try", text: "是去一个谁都没有提前写好的地方。", image: assets.mergeTry },
  { speaker: "回忆", node: "ending_merge_try", text: "你把空白页翻到最后。", image: assets.mergeTry },
  { speaker: "回忆", node: "ending_merge_try", text: "这一次，没有任何人提前写好答案。", image: assets.mergeTry },
  { speaker: "回忆", node: "ending_merge_try", text: "门外响起很轻的一声风铃。", image: assets.mergeTry },
  { speaker: "回忆", node: "ending_merge_try", text: "你推门走出去。", image: assets.mergeUnchanged },
  { speaker: "回忆", node: "ending_merge_try", text: "楼道、街灯、便利店、手机时间，一切都没有变化。", image: assets.mergeUnchanged },
  { speaker: "回忆", node: "ending_merge_try", text: "你站在原地，几乎以为合并失败了。", image: assets.mergeUnchanged },
  { speaker: "回忆", node: "ending_merge_try", text: "下一刻，有人从楼梯转角走上来。", image: assets.mergeReunion },
  { speaker: "回忆", node: "ending_merge_try", text: "林夏手里拿着两支冰淇淋。", image: assets.mergeReunion },
  { speaker: "回忆", node: "ending_merge_try", text: "周砚川跟在她后面，拎着一袋猫粮和一盏新的露营灯。", image: assets.mergeReunion },
  { speaker: "林夏", node: "ending_merge_try", text: "原来你真住在这。", image: assets.mergeReunion },
  { speaker: "周砚川", node: "ending_merge_try", text: "看来不是偶然。", image: assets.mergeReunion },
  { speaker: "回忆", node: "ending_merge_try", text: "他们同时看向你。", image: assets.mergeReunion },
  { speaker: "回忆", node: "ending_merge_try", text: "没有哪个世界赢了。", image: assets.mergeReunion },
  { speaker: "回忆", node: "ending_merge_try", text: "但你们在一个全新的世界里，又一次相遇。", image: assets.mergeReunion },
];

const choiceMeta = {
  old_city: {
    label: "留在老城",
    endingId: "ending_old_city",
    confirm: "留在老城，继续把熟悉的生活改到能继续。",
    lines: oldCityEnding,
    clue: "最终选择：留在老城",
  },
  new_city: {
    label: "去新城",
    endingId: "ending_new_city",
    confirm: "去新城，开始把陌生的生活过成家。",
    lines: newCityEnding,
    clue: "最终选择：去新城",
  },
  self: {
    label: "都不选",
    endingId: "ending_self",
    confirm: "暂时不进入任何一个被安排好的未来。",
    lines: selfEnding,
    clue: "最终选择：都不选",
  },
  merge_try: {
    label: "试着合并",
    endingId: "ending_merge_try",
    confirm: "承担代价，试着去一个没人提前写好的地方。",
    lines: mergeEnding,
    clue: "最终选择：试着合并",
  },
};

const endingGallery = [
  {
    id: "ending_old_city",
    route: "old_city",
    routeLabel: "留在老城",
    image: assets.oldCity,
  },
  {
    id: "ending_new_city",
    route: "new_city",
    routeLabel: "去新城",
    image: assets.newCity,
  },
  {
    id: "ending_self",
    route: "self",
    routeLabel: "都不选",
    image: assets.selfRoom,
  },
  {
    id: "ending_merge_try",
    route: "merge_try",
    routeLabel: "试着合并",
    image: assets.mergeReunion,
  },
];

const lockedAchievementHints = {
  ending_merge_try: {
    title: "???",
    routeLabel: "隐藏结局",
    hint: "还有一种选择没有出现。先看清两种生活都不完整，再回到最后选择。",
    marker: "提示",
  },
};

function init() {
  state.unlockedMergeEnding = computeMergeUnlock();
  startLinear(introLines, () => {
    unlockEvidence("missing");
    addClue(costEcho());
    startLinear(overlapLines, () => {
      startLinear(zhouReadsLinLines, () => {
        state.zhouUnderstandsLin = true;
        unlockEvidence("zhouReads");
        addClue("周砚川理解：林夏的世界不是只有浪漫，也在处理未知。");
        startLinear(linReadsZhouLines, () => {
          state.linUnderstandsZhou = true;
          unlockEvidence("linReads");
          addClue("林夏理解：周砚川的稳定不是控制，而是生活根系。");
          startLinear(mutualLines, () => {
            startLinear(finalWordsLines, showFinalChoice);
          });
        });
      });
    });
  });
  updateEvidence();
  updateLog();
  updatePhoneContacts();
}

function computeMergeUnlock() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("merge") === "1") return true;
  const world =
    localStorage.getItem("world_understanding") ||
    localStorage.getItem("worldUnderstanding") ||
    localStorage.getItem("project002_world_understanding") ||
    "";
  const cost =
    localStorage.getItem("life_cost_preference") ||
    localStorage.getItem("lifeCostPreference") ||
    localStorage.getItem("project002_life_cost_preference") ||
    "";
  const known = localStorage.getItem("known_E012_missing_life_pages") || localStorage.getItem("project002_known_E012");
  return ["suspicious", "cautious"].includes(world) && cost === "suspicious" && known === "true";
}

function costEcho() {
  const cost =
    localStorage.getItem("life_cost_preference") ||
    localStorage.getItem("lifeCostPreference") ||
    localStorage.getItem("project002_life_cost_preference") ||
    "none";
  return {
    old_city: "界面记录：你曾经更能接受老城的重复。",
    new_city: "界面记录：你曾经更能接受新城的陌生。",
    neither: "界面记录：你曾经还不能接受任何一种完整生活。",
    suspicious: "界面记录：你曾经怀疑两种生活都被整理过。",
    none: "界面记录：两种生活的代价都还在桌面上。",
  }[cost] || "界面记录：两种生活的代价都还在桌面上。";
}

function startLinear(lines, onComplete, mode = "linear") {
  state.mode = mode;
  currentLines = lines;
  state.lineIndex = 0;
  afterLinear = onComplete;
  setButtons([]);
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
  renderLine(line);
}

function advanceLine() {
  if (state.mode !== "linear" && state.mode !== "ending") return;
  state.lineIndex += 1;
  renderCurrentLine();
}

function renderLine(line) {
  const isEndingLine = state.mode === "ending";
  const isNarrationLine = line.speaker === "回忆";
  sceneCard.classList.toggle("is-ending-sequence", isEndingLine);
  sceneCard.classList.remove("is-ending-complete");
  achievementCard.classList.remove("open");
  if (line.unlockFriendRequests) unlockFriendRequests();

  speaker.textContent = displaySpeakerName(line.speaker);
  nodeLabel.textContent = "";
  dialogueText.textContent = line.text;
  if (dialoguePanel) {
    dialoguePanel.classList.toggle("is-narration", isNarrationLine);
    dialoguePanel.classList.remove("line-enter");
    void dialoguePanel.offsetWidth;
    dialoguePanel.classList.add("line-enter");
  }
  if (line.image && sceneImage.getAttribute("src") !== line.image) {
    sceneCard.classList.remove("cg-swapping");
    void sceneCard.offsetWidth;
    sceneImage.src = line.image;
    sceneCard.classList.add("cg-swapping");
  }
  if (line.image) sceneCard.style.setProperty("--chapter5-current-cg", `url("${line.image}")`);
  appendLogEntry(line);
}

function displaySpeakerName(name) {
  if (name === "玩家") return "我";
  if (name === "回忆") return "叙述";
  if (name === "404") return "叙述";
  return name;
}

function showFinalChoice() {
  state.mode = "choice";
  sceneCard.classList.remove("is-ending-sequence", "is-ending-complete", "cg-swapping");
  achievementCard.classList.remove("open");
  hideTestFeedbackPanel();
  nextCue.classList.remove("hidden");
  sceneImage.src = assets.finalChoiceBoard;
  sceneCard.style.setProperty("--chapter5-current-cg", `url("${assets.finalChoiceBoard}")`);
  speaker.textContent = "我";
  nodeLabel.textContent = "";
  dialogueText.textContent = "选择终于回到你手里。";
  unlockEvidence("finalChoice");
  addClue("最终选择板已打开。");
  const choices = [
    { label: "留在老城", action: "old_city" },
    { label: "去新城", action: "new_city" },
    { label: "都不选", action: "self" },
  ];
  if (state.unlockedMergeEnding) choices.push({ label: "试着合并", action: "merge_try" });
  setButtons(choices);
}

function setButtons(buttons) {
  sceneCard.classList.toggle("has-floating-choices", buttons.length > 0);
  questionGrid.hidden = false;
  if (choiceStack) choiceStack.hidden = false;
  questionGrid.classList.remove("collapsed");
  questionGrid.innerHTML = "";
  if (!buttons.length) {
    questionGrid.classList.add("collapsed");
    questionGrid.hidden = true;
    if (choiceStack) choiceStack.hidden = true;
    return;
  }
  buttons.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.action = item.action;
    button.textContent = item.label;
    questionGrid.appendChild(button);
  });
}

function openConfirm(choice) {
  const meta = choiceMeta[choice];
  if (!meta) return;
  pendingChoice = choice;
  confirmTitle.textContent = "你确定吗？";
  confirmText.textContent = "";
  confirmModal.classList.add("open");
  confirmModal.setAttribute("aria-hidden", "false");
}

function closeConfirm() {
  pendingChoice = null;
  confirmModal.classList.remove("open");
  confirmModal.setAttribute("aria-hidden", "true");
}

function confirmChoice() {
  if (!pendingChoice) return;
  const choice = pendingChoice;
  const meta = choiceMeta[choice];
  closeConfirm();
  state.finalChoice = choice;
  state.endingId = meta.endingId;
  state.finalChoiceConfirmed = true;
  localStorage.setItem("project002_final_choice", choice);
  localStorage.setItem("project002_ending_id", meta.endingId);
  localStorage.removeItem("project002_ending_achievement");
  clearFriendRequests();
  addClue(meta.clue);
  updatePhoneStatus();
  startLinear(meta.lines, finishEnding, "ending");
}

function finishEnding() {
  state.mode = "complete";
  const achievement = achievements[state.endingId];
  if (achievement) {
    achievementTitle.textContent = achievement.title;
    achievementText.textContent = achievement.text;
    achievementCard.classList.add("open");
    localStorage.setItem("project002_ending_achievement", achievement.title);
    unlockAchievement(state.endingId);
    addClue(`成就达成：${achievement.title}`);
  }
  updatePhoneStatus();
  sceneCard.classList.add("is-ending-sequence", "is-ending-complete");
  nextCue.classList.add("hidden");
  setButtons([]);
  showTestFeedbackPanel();
}

function showTestFeedbackPanel() {
  if (!testFeedbackPanel) return;
  testFeedbackPanel.hidden = false;
  testFeedbackPanel.classList.add("open");
}

function hideTestFeedbackPanel() {
  if (!testFeedbackPanel) return;
  testFeedbackPanel.classList.remove("open");
  testFeedbackPanel.hidden = true;
}

function unlockEvidence(id) {
  if (!id || state.evidence.has(id)) return;
  state.evidence.add(id);
  updateEvidence();
}

function addClue(text) {
  if (!text || state.clues.includes(text)) return;
  state.clues.push(text);
  updateClues();
}

function updateEvidence() {
  document.querySelectorAll("[data-evidence]").forEach((card) => {
    card.classList.toggle("locked", !state.evidence.has(card.dataset.evidence));
    card.classList.toggle("unlocked", state.evidence.has(card.dataset.evidence));
  });
  const count = state.evidence.size;
  evidenceCount.textContent = `${count}/4`;
  evidenceEmpty.classList.toggle("hidden", count > 0);
}

function updateClues() {
  clueList.innerHTML = "";
  if (!state.clues.length) {
    const item = document.createElement("li");
    item.className = "empty";
    item.textContent = "尚未形成最终记录。";
    clueList.appendChild(item);
    return;
  }
  state.clues.forEach((text) => {
    const item = document.createElement("li");
    item.textContent = text;
    clueList.appendChild(item);
  });
}

function appendLogEntry(line) {
  const last = state.log[state.log.length - 1];
  if (last && last.speaker === line.speaker) {
    last.node = line.node;
    last.texts = Array.isArray(last.texts) ? last.texts : [last.text].filter(Boolean);
    last.texts.push(line.text);
    last.text = last.texts.join("\n\n");
    updateLog();
    return;
  }
  state.log.push({
    speaker: line.speaker,
    node: line.node,
    text: line.text,
    texts: [line.text],
  });
  updateLog();
}

function updateLog() {
  logList.innerHTML = "";
  state.log.slice(-80).forEach((entry) => {
    const item = document.createElement("li");
    const speakerLabel = document.createElement("span");
    const copy = document.createElement("div");
    const lines = Array.isArray(entry.texts) ? entry.texts : [entry.text];
    const isNarration = entry.speaker === "回忆";
    item.className = `log-entry ${isNarration ? "log-narration" : "log-dialogue"}`;
    speakerLabel.className = "log-speaker";
    speakerLabel.textContent = displaySpeakerName(entry.speaker);
    copy.className = "log-lines";
    lines.forEach((text) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      copy.appendChild(paragraph);
    });
    item.append(speakerLabel, copy);
    logList.appendChild(item);
  });
  const lineCount = state.log.reduce((count, entry) => {
    const lines = Array.isArray(entry.texts) ? entry.texts : [entry.text];
    return count + lines.length;
  }, 0);
  logCount.textContent = `${lineCount} 条`;
  logEmpty.classList.toggle("hidden", state.log.length > 0);
}

function getUnlockedEndings() {
  const raw = localStorage.getItem(achievementStorageKey);
  let ids = [];
  try {
    ids = raw ? JSON.parse(raw) : [];
  } catch {
    ids = [];
  }
  const currentEnding = localStorage.getItem("project002_ending_id");
  if (currentEnding && achievements[currentEnding] && !ids.includes(currentEnding)) ids.push(currentEnding);
  return ids.filter((id) => achievements[id]);
}

function unlockAchievement(id) {
  if (!id || !achievements[id]) return;
  const ids = getUnlockedEndings();
  if (!ids.includes(id)) ids.push(id);
  localStorage.setItem(achievementStorageKey, JSON.stringify(ids));
  renderPhoneAchievements();
}

function renderPhoneAchievements(selectedId = null) {
  const unlocked = new Set(getUnlockedEndings());
  const unlockedCount = unlocked.size;
  const wasOpen = phoneAchievements && !phoneAchievements.hidden;
  if (phoneAchievementEntry) phoneAchievementEntry.hidden = unlockedCount === 0;
  if (phoneAchievementsToggle) phoneAchievementsToggle.hidden = unlockedCount === 0;
  if (phoneAchievementSummary) {
    phoneAchievementSummary.textContent = unlockedCount
      ? `已解锁 ${unlockedCount}/${endingGallery.length} 个结局。`
      : "尚未解锁结局。";
  }
  if (!phoneAchievements || !phoneAchievementGrid) return;
  phoneAchievements.hidden = !(unlockedCount > 0 && (selectedId || wasOpen));
  phoneAchievements.classList.remove("detail-open");
  achievementProgress.textContent = `${unlockedCount}/${endingGallery.length}`;
  phoneAchievementGrid.innerHTML = "";
  endingGallery.forEach((ending) => {
    const isUnlocked = unlocked.has(ending.id);
    const achievement = achievements[ending.id];
    const lockedHint = lockedAchievementHints[ending.id];
    const button = document.createElement("button");
    button.type = "button";
    button.className = `phone-achievement ${isUnlocked ? "unlocked" : "locked"}`;
    button.dataset.achievementId = ending.id;
    button.disabled = !isUnlocked;
    const text = document.createElement("span");
    const title = document.createElement("strong");
    const route = document.createElement("small");
    title.textContent = isUnlocked ? achievement.title : lockedHint?.title || "???";
    route.textContent = isUnlocked ? ending.routeLabel : lockedHint?.routeLabel || ending.routeLabel;
    text.append(title, route);
    if (!isUnlocked) {
      const hint = document.createElement("em");
      hint.textContent = lockedHint?.hint || "尚未解锁";
      text.appendChild(hint);
    }
    const marker = document.createElement("b");
    marker.textContent = isUnlocked ? "查看" : lockedHint?.marker || "???";
    button.appendChild(text);
    button.appendChild(marker);
    phoneAchievementGrid.appendChild(button);
  });

  if (phoneAchievementPreview) phoneAchievementPreview.hidden = true;
  if (selectedId && unlocked.has(selectedId)) showAchievementPreview(selectedId);
}

function showAchievementPreview(id) {
  if (!phoneAchievementPreview || !id || !achievements[id]) {
    if (phoneAchievementPreview) phoneAchievementPreview.hidden = true;
    return;
  }
  const ending = endingGallery.find((item) => item.id === id);
  const achievement = achievements[id];
  if (!ending || !getUnlockedEndings().includes(id)) {
    phoneAchievementPreview.hidden = true;
    return;
  }
  phoneAchievements.hidden = false;
  phoneAchievementImage.src = ending.image;
  phoneAchievementImage.alt = achievement.title;
  phoneAchievementName.textContent = achievement.title;
  phoneAchievementDesc.textContent = achievement.text;
  phoneAchievementPreview.hidden = false;
  phoneAchievements.classList.add("detail-open");
  phoneAchievementGrid.querySelectorAll(".phone-achievement").forEach((button) => {
    button.classList.toggle("selected", button.dataset.achievementId === id);
  });
}

function showAchievementList() {
  if (phoneAchievements) phoneAchievements.hidden = false;
  phoneAchievements?.classList.remove("detail-open");
  if (phoneAchievementPreview) phoneAchievementPreview.hidden = true;
}

function hasFriendRequests() {
  return localStorage.getItem(friendRequestsStorageKey) === "true";
}

function hasUnseenFriendRequests() {
  return hasFriendRequests() && localStorage.getItem(friendRequestsSeenStorageKey) !== "true";
}

function unlockFriendRequests() {
  if (!hasFriendRequests()) {
    localStorage.setItem(friendRequestsStorageKey, "true");
    localStorage.removeItem(friendRequestsSeenStorageKey);
    addClue("手机联系人出现新的好友申请。");
  }
  updatePhoneContacts();
}

function clearFriendRequests() {
  localStorage.removeItem(friendRequestsStorageKey);
  localStorage.removeItem(friendRequestsSeenStorageKey);
  updatePhoneContacts();
}

function updatePhoneContacts() {
  const unlocked = hasFriendRequests();
  const unseen = hasUnseenFriendRequests();
  if (phoneContactEntry) phoneContactEntry.hidden = !unlocked;
  if (phoneContactsToggle) {
    phoneContactsToggle.hidden = !unlocked;
    phoneContactsToggle.classList.toggle("has-dot", unseen);
  }
  if (phoneContactSummary) {
    phoneContactSummary.textContent = unseen ? "有 2 条待处理申请。" : "好友申请已查看。";
  }
  if (phoneContacts && !unlocked) phoneContacts.hidden = true;
  if (phoneButton) phoneButton.classList.toggle("attention", unseen);
  phoneContactEntry?.classList.toggle("has-dot", unseen);
}

function showPhoneContacts() {
  if (!hasFriendRequests() || !phoneContacts) return;
  localStorage.setItem(friendRequestsSeenStorageKey, "true");
  updatePhoneContacts();
  if (phoneAchievements) phoneAchievements.hidden = true;
  phoneAchievements?.classList.remove("detail-open");
  if (phoneAchievementPreview) phoneAchievementPreview.hidden = true;
  phoneContacts.hidden = false;
  phoneContacts.scrollIntoView({ block: "nearest" });
}

function updatePhoneStatus() {
  updatePhoneContacts();
  renderPhoneAchievements();
  if (hasUnseenFriendRequests()) {
    phoneStatus.textContent = "联系人有新的申请";
    phoneDetail.textContent = "点开联系人查看。";
    return;
  }
  if (state.finalChoiceConfirmed) {
    const achievement = localStorage.getItem("project002_ending_achievement");
    phoneStatus.textContent = `最终选择：${choiceMeta[state.finalChoice].label}`;
    phoneDetail.textContent = achievement ? `已解锁成就：${achievement}。点击成就查看CG。` : `结局记录：${state.endingId}`;
    return;
  }
  const unlockedCount = getUnlockedEndings().length;
  phoneStatus.textContent = unlockedCount ? `已解锁 ${unlockedCount}/4 个结局` : "最后选择尚未确认";
  phoneDetail.textContent = unlockedCount
    ? "点击已解锁成就查看对应CG。"
    : state.unlockedMergeEnding
      ? "隐藏选项已开放。"
      : "默认显示三项最终选择。";
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
  logModal.classList.add("open");
  logModal.setAttribute("aria-hidden", "false");
}

function closeLog() {
  logModal.classList.remove("open");
  logModal.setAttribute("aria-hidden", "true");
}

function openPhone() {
  const shouldShowContacts = hasUnseenFriendRequests();
  updatePhoneStatus();
  if (phoneContacts) phoneContacts.hidden = true;
  if (phoneAchievements) phoneAchievements.hidden = true;
  phoneModal.classList.add("open");
  phoneModal.setAttribute("aria-hidden", "false");
  if (shouldShowContacts) showPhoneContacts();
}

function closePhone() {
  phoneModal.classList.remove("open");
  phoneModal.setAttribute("aria-hidden", "true");
}

document.querySelector(".topbar").addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  if (button.dataset.action === "phone") openPhone();
  if (button.dataset.action === "evidence") openEvidence();
  if (button.dataset.action === "log") openLog();
});

sceneCard.addEventListener("click", (event) => {
  if (
    event.target.closest("button") ||
    (state.mode !== "linear" && state.mode !== "ending") ||
    evidenceModal.classList.contains("open") ||
    logModal.classList.contains("open") ||
    phoneModal.classList.contains("open") ||
    confirmModal.classList.contains("open")
  ) {
    return;
  }
  advanceLine();
});

questionGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const action = button.dataset.action;
  if (action === "restart_choice") {
    showFinalChoice();
    return;
  }
  if (action === "restart_ch05") {
    window.location.reload();
    return;
  }
  if (action === "goto_ch1" && window.P002ChapterMenu) {
    window.P002ChapterMenu.gotoFirst();
    return;
  }
  openConfirm(action);
});

testFeedbackPanel?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-feedback-action]");
  if (!button) return;
  const action = button.dataset.feedbackAction;
  if (action === "restart_choice") {
    showFinalChoice();
    return;
  }
  if (action === "end_game") {
    if (window.P002ChapterMenu) {
      window.P002ChapterMenu.gotoFirst();
      return;
    }
    window.location.href = "./index.html";
  }
});

document.querySelector("#closeEvidence").addEventListener("click", closeEvidence);
document.querySelector("#closeLog").addEventListener("click", closeLog);
document.querySelector("#closePhone").addEventListener("click", closePhone);
document.querySelector("#confirmBack").addEventListener("click", closeConfirm);
confirmOk.addEventListener("click", confirmChoice);
phoneModal.addEventListener("click", (event) => {
  const phoneAction = event.target.closest("[data-phone-action]");
  if (phoneAction?.dataset.phoneAction === "evidence") {
    closePhone();
    openEvidence();
    return;
  }
  if (phoneAction?.dataset.phoneAction === "achievements") {
    renderPhoneAchievements();
    if (phoneContacts) phoneContacts.hidden = true;
    if (phoneAchievements) phoneAchievements.hidden = false;
    phoneAchievements?.scrollIntoView({ block: "nearest" });
    return;
  }
  if (phoneAction?.dataset.phoneAction === "contacts") {
    showPhoneContacts();
    return;
  }
  if (event.target.closest("[data-achievement-back]")) {
    showAchievementList();
    return;
  }
  const achievementButton = event.target.closest("[data-achievement-id]");
  if (achievementButton && !achievementButton.disabled) {
    showAchievementPreview(achievementButton.dataset.achievementId);
  }
});

[evidenceModal, logModal, phoneModal, confirmModal].forEach((modal) => {
  modal.addEventListener("click", (event) => {
    if (event.target !== modal) return;
    if (modal === evidenceModal) closeEvidence();
    if (modal === logModal) closeLog();
    if (modal === phoneModal) closePhone();
    if (modal === confirmModal) closeConfirm();
  });
});

init();

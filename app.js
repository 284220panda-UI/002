const state = {
  mode: "linear",
  lineIndex: 0,
  selectedCharacter: null,
  asked: {
    zhouObserve: false,
    zhouIdentity: false,
    zhouProof: false,
    linObserve: false,
    linIdentity: false,
    linProof: false,
  },
  evidence: new Set(),
  itemQueue: [],
  clues: [],
  log: [],
  phoneUnlocked: false,
  phoneViewed: false,
  contradictionShown: false,
  deductionDone: false,
  deductionFirstConflict: "none",
  earlyBias: "none",
  characterNamesKnown: {
    zhou: false,
    lin: false,
  },
};

const standeeAssets = {
  zhou: {
    select: "./assets/characters/game_ready/zhou_yanchuan_01_smile_waist_game_ready_v2.png",
    neutral: "./assets/characters/game_ready/zhou_yanchuan_01_smile_waist_game_ready_v2.png",
    frown: "./assets/characters/game_ready/zhou_yanchuan_05_jealous_waist_game_ready_v2.png",
    embarrassed: "./assets/characters/game_ready/zhou_yanchuan_03_embarrassed_waist_game_ready_v2.png",
  },
  lin: {
    select: "./assets/characters/game_ready/lin_xia_01_smile_waist_game_ready_v2.png",
    teasing: "./assets/characters/game_ready/lin_xia_02_teasing_waist_game_ready_v2.png",
    offended: "./assets/characters/game_ready/lin_xia_03_speechless_waist_game_ready_v2.png",
    serious: "./assets/characters/game_ready/lin_xia_04_focused_camera_waist_game_ready_v2.png",
  },
};

const evidenceClues = {
  door: "周砚川知道门锁密码 0417，也知道备用钥匙位置。",
  photo: "林夏知道玩家挑酸奶的习惯，并持有便利店拍立得。",
  chat: "手机里有一条“对象”备注聊天截图，但 404 对不上是哪一个人。",
};

const evidenceItems = {
  door: {
    title: "门锁密码：0417",
    desc: "周砚川的证词已贴进关系记录。",
    image: "./assets/evidence/evidence_door_lock_code_v1.png",
  },
  photo: {
    title: "便利店拍立得",
    desc: "林夏随身照片已贴进关系记录。",
    image: "./assets/evidence/evidence_polaroid_yogurt_v1.png",
  },
  chat: {
    title: "聊天截图",
    desc: "异常聊天截图已贴进矛盾记录。",
    image: "./assets/evidence/evidence_chat_snapshot_v1.png",
  },
};

const introLines = [
  { speaker: "404", node: "ch01_001_wakeup", text: "加载记忆中。", scene: "sleep" },
  { speaker: "玩家", node: "ch01_002_double_claim", text: "真是睡了一个好觉啊。" },
  {
    speaker: "周砚川",
    character: "zhou",
    expression: "neutral",
    node: "ch01_002_double_claim",
    text: "你醒了。",
  },
  {
    speaker: "林夏",
    character: "lin",
    expression: "teasing",
    node: "ch01_002_double_claim",
    text: "哇，还会眨眼，问题不大。",
  },
  { speaker: "玩家", node: "ch01_002_double_claim", text: "？！怎么会有两个人在这！" },
  {
    speaker: "周砚川",
    character: "zhou",
    expression: "neutral",
    node: "ch01_002_double_claim",
    text: "先别坐起来。你刚才突然失去意识。",
  },
  {
    speaker: "林夏",
    character: "lin",
    expression: "teasing",
    node: "ch01_002_double_claim",
    text: "他说得很冷静，其实刚才水杯都差点捏爆。",
  },
  {
    speaker: "周砚川",
    character: "zhou",
    expression: "frown",
    node: "ch01_002_double_claim",
    text: "没有。",
  },
  {
    speaker: "林夏",
    character: "lin",
    expression: "offended",
    node: "ch01_002_double_claim",
    text: "有。我听见塑料瓶响了。",
  },
  { speaker: "玩家", node: "ch01_002_double_claim", text: "……你们是谁？" },
  {
    speaker: "周砚川",
    character: "zhou",
    expression: "neutral",
    node: "ch01_002_double_claim",
    text: "周砚川。",
    learnName: "zhou",
  },
  {
    speaker: "林夏",
    character: "lin",
    expression: "teasing",
    node: "ch01_002_double_claim",
    text: "林夏。现在报户口吗？",
    learnName: "lin",
  },
  { speaker: "玩家", node: "ch01_002_double_claim", text: "为什么你们都在我房间？" },
  {
    speaker: "周砚川",
    character: "zhou",
    expression: "neutral",
    node: "ch01_002_double_claim",
    text: "因为我是你对象。",
  },
  {
    speaker: "林夏",
    character: "lin",
    expression: "teasing",
    node: "ch01_002_double_claim",
    text: "巧了，我也是。",
  },
  { speaker: "404", node: "ch01_002_double_claim", text: "关系记录对不上。你觉得谁是你的对象呢？" },
];

const falseChoiceFeedback = {
  him: [
    { speaker: "林夏", character: "lin", expression: "offended", text: "这么快？你是掷硬币选的吗？" },
    { speaker: "周砚川", character: "zhou", expression: "neutral", text: "嗯，看来没太大问题。" },
  ],
  her: [
    { speaker: "林夏", character: "lin", expression: "teasing", text: "谢谢信任，但这个信任来得有点敷衍。" },
    { speaker: "周砚川", character: "zhou", expression: "neutral", text: "证据还不完整。" },
  ],
  single: [
    { speaker: "404", text: "单身声明未通过校验。" },
    { speaker: "林夏", character: "lin", expression: "offended", text: "好惨，连单身都要被便签驳回。" },
    { speaker: "周砚川", character: "zhou", expression: "neutral", text: "它只是在判断记录。" },
  ],
  dream: [
    { speaker: "404", text: "睡眠状态无法解释当前冲突。" },
    { speaker: "林夏", character: "lin", expression: "teasing", text: "它还挺会补刀。" },
    { speaker: "周砚川", character: "zhou", expression: "frown", text: "至少说明你不是单纯没睡醒。" },
  ],
};

const askLines = {
  zhouIdentity: [
    { speaker: "玩家", text: "你是谁？" },
    { speaker: "周砚川", character: "zhou", expression: "neutral", text: "周砚川。" },
    { speaker: "玩家", text: "然后呢？" },
    { speaker: "周砚川", character: "zhou", expression: "neutral", text: "我是你对象。" },
    { speaker: "玩家", text: "你说得也太平了。" },
    { speaker: "周砚川", character: "zhou", expression: "frown", text: "因为这是事实。" },
    { speaker: "玩家", text: "事实要有证据。" },
    { speaker: "周砚川", character: "zhou", expression: "neutral", text: "门锁密码是 0417。" },
    { speaker: "玩家", text: "（尝试输入，门打开了）……" },
    { speaker: "周砚川", character: "zhou", expression: "embarrassed", text: "不是猜的。你设的时候说，这个数字好记。" },
    { speaker: "玩家", text: "为什么好记？" },
    { speaker: "周砚川", character: "zhou", expression: "embarrassed", text: "你当时没说。我问了，你说“不告诉你”。" },
  ],
  zhouProof: [
    { speaker: "玩家", text: "你怎么证明？" },
    { speaker: "周砚川", character: "zhou", expression: "neutral", text: "你左边抽屉第二层有备用钥匙。" },
    { speaker: "玩家", text: "你翻过我抽屉？" },
    { speaker: "周砚川", character: "zhou", expression: "frown", text: "你让我放的。" },
    { speaker: "玩家", text: "我为什么让你放？" },
    { speaker: "周砚川", character: "zhou", expression: "neutral", text: "因为你第三次把钥匙忘在门外。" },
    { speaker: "玩家", text: "第三次？" },
    { speaker: "周砚川", character: "zhou", expression: "neutral", text: "第一次你说是意外。第二次你说门锁针对你。第三次你让我想办法。" },
    { speaker: "玩家", text: "所以你的办法是放备用钥匙？" },
    { speaker: "周砚川", character: "zhou", expression: "embarrassed", text: "还有换个大钥匙扣。你说丑。" },
    { speaker: "玩家", text: "确实听起来像我会说的话。" },
    { speaker: "周砚川", character: "zhou", expression: "embarrassed", text: "嗯。所以我没换。" },
  ],
  linIdentity: [
    { speaker: "玩家", text: "你是谁？" },
    { speaker: "林夏", character: "lin", expression: "teasing", text: "林夏。" },
    { speaker: "玩家", text: "也是我对象？" },
    { speaker: "林夏", character: "lin", expression: "offended", text: "这个“也”字真的很伤人。我先记一笔。" },
    { speaker: "玩家", text: "那你说说证据？" },
    { speaker: "林夏", character: "lin", expression: "teasing", text: "你买酸奶会看配料表。" },
    { speaker: "玩家", text: "这很多人都可能知道。" },
    { speaker: "林夏", character: "lin", expression: "teasing", text: "看完会买配料表最健康的那瓶。" },
    { speaker: "玩家", text: "……" },
    { speaker: "林夏", character: "lin", expression: "serious", text: "而且会站在冷柜前面纠结十五分钟，像在评审年度最佳酸奶。" },
    { speaker: "玩家", text: "你怎么知道？" },
    { speaker: "林夏", character: "lin", expression: "teasing", text: "因为我拍了。" },
    { speaker: "玩家", text: "你偷拍我？" },
    { speaker: "林夏", character: "lin", expression: "offended", text: "不是偷拍，是生活观察。说偷拍显得我很不专业。" },
  ],
  linProof: [
    { speaker: "玩家", text: "你怎么证明我们是那种关系？" },
    { speaker: "林夏", character: "lin", expression: "teasing", text: "哪种关系？说清楚一点。" },
    { speaker: "玩家", text: "别绕。" },
    { speaker: "林夏", character: "lin", expression: "offended", text: "好吧，今天的你不太好逗。" },
    { speaker: "玩家", text: "照片什么时候拍的？" },
    { speaker: "林夏", character: "lin", expression: "teasing", text: "上周三。便利店第二排冷柜前。" },
    { speaker: "玩家", text: "你为什么拍这个？" },
    { speaker: "林夏", character: "lin", expression: "serious", text: "你那天很认真。" },
    { speaker: "玩家", text: "挑酸奶而已。" },
    { speaker: "林夏", character: "lin", expression: "serious", text: "你认真做小事的时候，会让人觉得这个世界还挺值得拍一下的。" },
    { speaker: "玩家", text: "……" },
    { speaker: "林夏", character: "lin", expression: "teasing", text: "别这样看我。我刚才那句已经超过今日认真额度了。" },
  ],
};

const contradictionLines = [
  { speaker: "404", text: "这条聊天有点怪。" },
  { speaker: "404", text: "备注是“对象”，但我对不上是哪一个人。" },
  { speaker: "404", text: "先贴到矛盾区。" },
  { speaker: "玩家", text: "这是谁发的？" },
  { speaker: "周砚川", character: "zhou", expression: "frown", text: "像我会说的话。" },
  { speaker: "林夏", character: "lin", expression: "teasing", text: "你这个“像”听起来很危险。" },
  { speaker: "周砚川", character: "zhou", expression: "frown", text: "因为我不记得发过。" },
  { speaker: "林夏", character: "lin", expression: "serious", text: "我也不记得。" },
  { speaker: "玩家", text: "你们都不记得？" },
  { speaker: "周砚川", character: "zhou", expression: "neutral", text: "不记得，不代表没发生。" },
  { speaker: "林夏", character: "lin", expression: "teasing", text: "哇，这句话终于有点像悬疑片男主了。" },
  { speaker: "周砚川", character: "zhou", expression: "frown", text: "我只是说可能性。" },
  { speaker: "林夏", character: "lin", expression: "teasing", text: "嗯，可能性先生。" },
  { speaker: "404", text: "矛盾已贴好。" },
];

const endingLines = [
  { speaker: "404", text: "当前关系冲突未解决。" },
  { speaker: "404", text: "建议：拿一个人的话去问另一个人。" },
  { speaker: "玩家", text: "也就是说，我要拿你们的话去问对方？" },
  { speaker: "林夏", character: "lin", expression: "teasing", text: "终于到互相拆台环节了？" },
  { speaker: "周砚川", character: "zhou", expression: "neutral", text: "如果能排除错误信息，我同意。" },
  { speaker: "林夏", character: "lin", expression: "teasing", text: "你看，他连拆台都说得像开会。" },
  { speaker: "周砚川", character: "zhou", expression: "frown", text: "不是拆台，是核对。" },
  { speaker: "林夏", character: "lin", expression: "teasing", text: "更像开会了。" },
  { speaker: "玩家", text: "……" },
  { speaker: "玩家", text: "我需要知道，你们到底谁在说真话。" },
  { speaker: "404", text: "第二章已解锁：交换证词。" },
];

const speaker = document.querySelector("#speaker");
const nodeLabel = document.querySelector("#node");
const dialogueText = document.querySelector("#dialogueText");
const dialoguePanel = document.querySelector(".dialogue-panel");
const chapterGoal = document.querySelector("#chapterGoal");
const questionGrid = document.querySelector("#questionGrid");
const questionHint = document.querySelector("#questionHint");
const phoneButton = document.querySelector('[data-action="phone"]');
const clueList = document.querySelector("#clueList");
const evidenceCount = document.querySelector("#evidenceCount");
const evidenceEmpty = document.querySelector("#evidenceEmpty");
const phoneModal = document.querySelector("#phoneModal");
const evidenceModal = document.querySelector("#evidenceModal");
const logModal = document.querySelector("#logModal");
const logList = document.querySelector("#logList");
const logEmpty = document.querySelector("#logEmpty");
const logCount = document.querySelector("#logCount");
const itemModal = document.querySelector("#itemModal");
const itemImage = document.querySelector("#itemImage");
const itemTitle = document.querySelector("#itemTitle");
const itemDesc = document.querySelector("#itemDesc");
const judgementRow = document.querySelector("#judgementRow");
const sceneCard = document.querySelector(".scene-card");
const zhouPanel = document.querySelector("#zhouPanel");
const linPanel = document.querySelector("#linPanel");

let currentLines = introLines;
let afterLinear = showFalseChoice;
let afterItemPopup = null;

renderLine(currentLines[0]);
setButtons([{ label: "点击继续", action: "continue" }]);

dialoguePanel.addEventListener("click", () => {
  if (state.mode === "linear") advanceLine();
});

document.querySelectorAll(".standee").forEach((standee) => {
  standee.addEventListener("click", () => {
    if (state.mode !== "ask") return;
    selectCharacter(standee.dataset.character);
  });
  standee.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    if (state.mode === "ask") selectCharacter(standee.dataset.character);
  });
});

document.querySelector(".topbar").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button || !button.dataset.action) return;
  if (button.dataset.action === "phone") tryOpenPhone();
  if (button.dataset.action === "evidence") openEvidence();
  if (button.dataset.action === "log") openLog();
});

questionGrid.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button || button.disabled) return;
  if (button.dataset.action !== "continue") recordChoice(button.textContent);
  handleAction(button.dataset.action);
});

document.querySelectorAll(".evidence-card").forEach((card) => {
  card.addEventListener("click", () => {
    const clue = evidenceClues[card.dataset.evidence];
    if (!state.evidence.has(card.dataset.evidence)) return;
    renderLine({ speaker: "证物", node: `evidence_${card.dataset.evidence}`, text: clue });
  });
});

judgementRow.addEventListener("click", (event) => {
  const judge = event.target.dataset.judge;
  if (!judge) return;
  if (!state.evidence.has("chat")) {
    renderLine({ speaker: "404", node: "deduction_locked", text: "还不能判断。异常聊天还没贴进来。" });
    return;
  }
  document.querySelectorAll(".judgement-row button").forEach((button) => {
    button.classList.toggle("selected", button.dataset.judge === judge);
  });
  state.deductionDone = true;
  const judgeRecords = {
    zhou: { deductionFirstConflict: "zhou_more_credible", earlyBias: "zhou" },
    lin: { deductionFirstConflict: "lin_more_credible", earlyBias: "lin" },
    both: { deductionFirstConflict: "both_suspicious", earlyBias: "suspicious" },
    hold: { deductionFirstConflict: "hold", earlyBias: "cautious" },
  };
  state.deductionFirstConflict = judgeRecords[judge].deductionFirstConflict;
  state.earlyBias = judgeRecords[judge].earlyBias;
  closeEvidence();
  const text = {
    zhou: "阶段判断已记录：周砚川更可信。",
    lin: "阶段判断已记录：林夏更可信。",
    both: "阶段判断已记录：两人均存在异常。",
    hold: "阶段判断已记录：证据不足。",
  };
  const judgeFeedback = {
    zhou: [
      { speaker: "林夏", character: "lin", expression: "offended", text: "好吧，我暂时输给门锁密码。" },
      { speaker: "周砚川", character: "zhou", expression: "neutral", text: "这不是比赛。" },
    ],
    lin: [
      { speaker: "林夏", character: "lin", expression: "teasing", text: "谢谢，酸奶照片立功了。" },
      { speaker: "周砚川", character: "zhou", expression: "neutral", text: "证据还不完整。" },
    ],
    both: [
      { speaker: "林夏", character: "lin", expression: "teasing", text: "听起来像我们都要被带走调查。" },
      { speaker: "周砚川", character: "zhou", expression: "neutral", text: "这个判断比较谨慎。" },
    ],
    hold: [
      { speaker: "周砚川", character: "zhou", expression: "neutral", text: "继续查。" },
      { speaker: "林夏", character: "lin", expression: "offended", text: "同意。虽然我不喜欢它这个语气。" },
    ],
  };
  startLinear(
    [{ speaker: "404", node: "deduction_first_conflict", text: text[judge] }, ...judgeFeedback[judge], ...endingLines],
    finishChapter
  );
});

document.querySelector("#closePhone").addEventListener("click", closePhone);
phoneModal.addEventListener("click", (event) => {
  if (event.target === phoneModal) closePhone();
});
document.querySelector("#closeEvidence").addEventListener("click", closeEvidence);
evidenceModal.addEventListener("click", (event) => {
  if (event.target === evidenceModal) closeEvidence();
});
document.querySelector("#closeLog").addEventListener("click", closeLog);
logModal.addEventListener("click", (event) => {
  if (event.target === logModal) closeLog();
});
document.querySelector("#closeItem").addEventListener("click", closeItem);
itemModal.addEventListener("click", (event) => {
  if (event.target === itemModal) closeItem();
});

function handleAction(action) {
  if (action === "continue") {
    advanceLine();
    return;
  }
  if (action.startsWith("false_")) {
    const key = action.replace("false_", "");
    startLinear([...falseChoiceFeedback[key], ...interrogationIntro()], enterAskMode);
    return;
  }
  if (action === "identity") askIdentity();
  if (action === "proof") askProof();
  if (action === "observe") observe();
  if (action === "phone") tryOpenPhone();
  if (action === "evidence") openEvidence();
  if (action === "restart") window.location.reload();
}

function advanceLine() {
  if (state.mode !== "linear") return;
  state.lineIndex += 1;
  if (state.lineIndex >= currentLines.length) {
    afterLinear();
    return;
  }
  renderLine(currentLines[state.lineIndex]);
}

function startLinear(lines, onDone) {
  state.mode = "linear";
  currentLines = lines;
  afterLinear = onDone;
  state.lineIndex = 0;
  renderLine(currentLines[0]);
  setButtons([{ label: "点击继续", action: "continue" }]);
}

function renderLine(line) {
  sceneCard.classList.toggle("sleep-mode", line.scene === "sleep");
  dialoguePanel.classList.remove("hidden");
  setDialogueStandees();
  speaker.textContent = displaySpeaker(line);
  nodeLabel.textContent = line.node || nodeForMode();
  dialogueText.textContent = line.text;
  updateExpression(line);
  updateStandeeFocus(line.character);
  updateTopbarState();
  recordDialogueLine();
  rememberCharacterName(line);
}

function updateTopbarState() {
  phoneButton.classList.toggle("attention", state.phoneUnlocked && !state.phoneViewed);
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

function displaySpeaker(line) {
  if (line.speaker === "周砚川" && !state.characterNamesKnown.zhou) return "？？";
  if (line.speaker === "林夏" && !state.characterNamesKnown.lin) return "？？";
  return line.speaker;
}

function updateExpression(line) {
  if (!line.character) return;
  const panel = line.character === "zhou" ? zhouPanel : linPanel;
  const expression = line.expression || "neutral";
  const source = standeeAssets[line.character]?.[expression];
  if (source) panel.src = source;
  panel.dataset.expression = expression;
}

function rememberCharacterName(line) {
  if (!line.learnName) return;
  state.characterNamesKnown[line.learnName] = true;
}

function setDialogueStandees() {
  zhouPanel.src = standeeAssets.zhou.neutral;
  linPanel.src = standeeAssets.lin.teasing;
  zhouPanel.dataset.expression = "neutral";
  linPanel.dataset.expression = "teasing";
}

function updateStandeeFocus(character) {
  zhouPanel.classList.toggle("active", character === "zhou" || state.selectedCharacter === "zhou");
  linPanel.classList.toggle("active", character === "lin" || state.selectedCharacter === "lin");
  zhouPanel.classList.toggle("completed", state.mode === "ask" && isCharacterComplete("zhou"));
  linPanel.classList.toggle("completed", state.mode === "ask" && isCharacterComplete("lin"));
}

function nodeForMode() {
  if (state.mode === "ask") return "ch01_006_free_ask_loop";
  if (state.mode === "choice") return "ch01_003_false_choice";
  return "chapter_01";
}

function showFalseChoice() {
  state.mode = "choice";
  renderLine({ speaker: "404", node: "ch01_003_false_choice", text: "你觉得谁是你的对象？" });
  setButtons([
    { label: "他？", action: "false_him" },
    { label: "她？", action: "false_her" },
    { label: "我单身谢谢", action: "false_single" },
    { label: "我是不是还没睡醒？", action: "false_dream" },
  ]);
}

function interrogationIntro() {
  return [
    { speaker: "404", node: "ch01_004_404_rejects", text: "我会把证词贴到记录里，之后可以对比~" },
    { speaker: "林夏", character: "lin", expression: "teasing", text: "当事人。这个称呼好像要开庭。" },
    { speaker: "周砚川", character: "zhou", expression: "neutral", text: "至少比“可疑人员”好。" },
    { speaker: "林夏", character: "lin", expression: "teasing", text: "你还挺容易满足。" },
    { speaker: "周砚川", character: "zhou", expression: "frown", text: "我只是觉得描述准确。" },
  ];
}

function enterAskMode() {
  state.mode = "ask";
  state.selectedCharacter = null;
  const shouldPromptPhone = state.phoneUnlocked && !state.phoneViewed;
  chapterGoal.textContent = shouldPromptPhone ? "查看手机异常聊天" : "点击人物开始询问";
  renderLine({
    speaker: "玩家",
    node: shouldPromptPhone ? "ch01_007_phone_prompt" : "ch01_005_interrogation_open",
    text: shouldPromptPhone ? "那就来看一下手机好了……" : "问谁好呢？",
  });
  updateStandeeFocus(null);
  setButtons([], { showHint: false });
}

function selectCharacter(character) {
  if (!state.selectedCharacter && isCharacterComplete(character)) {
    renderLine({
      speaker: "玩家",
      node: "ask_character_done",
      text: "这个人已经问完了，先问另一个人。",
    });
    setButtons([], { showHint: false });
    return;
  }

  if (
    state.selectedCharacter &&
    state.selectedCharacter !== character &&
    !isCharacterComplete(state.selectedCharacter)
  ) {
    const currentName = state.selectedCharacter === "zhou" ? "周砚川" : "林夏";
    renderLine({
      speaker: "404",
      node: "ask_character_locked",
      text: `先把${currentName}的问题问完，再换人。`,
    });
    setAskButtons(state.selectedCharacter);
    return;
  }

  state.selectedCharacter = character;
  const isZhou = character === "zhou";
  chapterGoal.textContent = isZhou ? "正在询问周砚川" : "正在询问林夏";
  updateStandeeFocus(character);
  renderLine({
    speaker: isZhou ? "周砚川" : "林夏",
    character,
    expression: isZhou ? "neutral" : "teasing",
    node: isZhou ? "ch01_006_ask_zhou" : "ch01_007_ask_lin",
    text: isZhou ? "你想问什么？" : "好，审讯开始？你先问。",
  });
  setAskButtons(character);
}

function setAskButtons(character) {
  const isZhou = character === "zhou";
  setButtons([
    { label: "先观察一下", action: "observe", disabled: isZhou ? state.asked.zhouObserve : state.asked.linObserve },
    { label: "你是谁？", action: "identity", disabled: isZhou ? state.asked.zhouIdentity : state.asked.linIdentity },
    { label: "你怎么证明？", action: "proof", disabled: isZhou ? state.asked.zhouProof : state.asked.linProof },
  ]);
}

function askIdentity() {
  if (state.selectedCharacter === "zhou") {
    state.asked.zhouIdentity = true;
    state.characterNamesKnown.zhou = true;
    unlockEvidence("door");
    startLinear(askLines.zhouIdentity, afterAsk);
  } else {
    state.asked.linIdentity = true;
    state.characterNamesKnown.lin = true;
    unlockEvidence("photo");
    startLinear(askLines.linIdentity, afterAsk);
  }
}

function askProof() {
  if (state.selectedCharacter === "zhou") {
    state.asked.zhouProof = true;
    state.characterNamesKnown.zhou = true;
    unlockEvidence("door");
    startLinear(askLines.zhouProof, afterAsk);
  } else {
    state.asked.linProof = true;
    state.characterNamesKnown.lin = true;
    unlockEvidence("photo");
    startLinear(askLines.linProof, afterAsk);
  }
}

function afterAsk() {
  const currentCharacter = state.selectedCharacter;
  flushItemPopups(() => {
    if (currentCharacter && !isCharacterComplete(currentCharacter)) {
      selectCharacter(currentCharacter);
      return;
    }
    if (maybeUnlockPhone()) return;
    enterAskMode();
  });
}

function maybeUnlockPhone() {
  if (!state.evidence.has("door") || !state.evidence.has("photo") || state.phoneUnlocked) return false;
  state.phoneUnlocked = true;
  startLinear([
    { speaker: "404", node: "ch01_007_phone_unlock", text: "两组关系证词已贴好。" },
    { speaker: "404", node: "ch01_007_phone_unlock", text: "手机里有一条异常聊天。" },
    { speaker: "404", node: "ch01_007_phone_unlock", text: "要看吗？" },
  ], enterAskMode);
  return true;
}

function observe() {
  const character = state.selectedCharacter;
  if (character === "zhou") {
    state.asked.zhouObserve = true;
    startLinear([
      {
        speaker: "玩家",
        node: "observe_zhou",
        text: "他站得很稳，但手一直压在袖口边缘。像是在努力保持冷静。",
      },
    ], afterAsk);
  } else {
    state.asked.linObserve = true;
    startLinear([
      {
        speaker: "玩家",
        node: "observe_lin",
        text: "她看起来轻松，视线却一直跟着你的反应。像是怕你真的慌了。",
      },
    ], afterAsk);
  }
}

function isCharacterComplete(character) {
  if (character === "zhou") {
    return state.asked.zhouObserve && state.asked.zhouIdentity && state.asked.zhouProof;
  }
  return state.asked.linObserve && state.asked.linIdentity && state.asked.linProof;
}

function tryOpenPhone() {
  if (!state.phoneUnlocked) {
    renderLine({ speaker: "404", node: "phone_locked", text: "手机里还没有可用线索。先问问两位当事人。" });
    return;
  }
  openPhone();
}

function openPhone() {
  phoneModal.classList.add("open");
  phoneModal.setAttribute("aria-hidden", "false");
  if (!state.phoneViewed) {
    state.phoneViewed = true;
    updateTopbarState();
    unlockEvidence("chat");
    judgementRow.classList.remove("locked");
    addClue("矛盾 01：同一条“对象”备注聊天记录，同时指向周砚川和林夏。");
  }
}

function closePhone() {
  phoneModal.classList.remove("open");
  phoneModal.setAttribute("aria-hidden", "true");
  if (state.phoneViewed && !state.contradictionShown && !state.deductionDone && state.mode !== "linear") {
    state.contradictionShown = true;
    flushItemPopups(() => startLinear(contradictionLines, enterDeductionMode));
  }
}

function enterDeductionMode() {
  state.mode = "deduction";
  chapterGoal.textContent = "打开证据做阶段判断";
  renderLine({ speaker: "404", node: "ch01_009_deduction_prompt", text: "证据入口已经开放。去做第一次阶段判断吧。" });
  setButtons([{ label: "查看证据", action: "evidence" }]);
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
    onDone();
    return;
  }
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

function finishChapter() {
  state.mode = "complete";
  chapterGoal.textContent = "第一章完成";
  renderLine({ speaker: "404", node: "ch01_010_chapter_end", text: "第一章结束。第二章：交换证词。" });
  setButtons([{ label: "重新开始第一章", action: "restart" }]);
}

function unlockEvidence(id) {
  const before = state.evidence.size;
  state.evidence.add(id);
  const card = document.querySelector(`[data-evidence="${id}"]`);
  if (card) {
    card.classList.remove("locked");
    card.classList.add("unlocked");
  }
  evidenceCount.textContent = `${state.evidence.size}/3`;
  evidenceEmpty.classList.toggle("hidden", state.evidence.size > 0);
  if (state.evidence.size !== before) {
    addClue(evidenceClues[id]);
    state.itemQueue.push(id);
  }
}

function addClue(text) {
  if (state.clues.includes(text)) return;
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

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
  { speaker: "周砚川", character: "zhou", node: "ch02_001_reopen_case", text: "核对事实是有效方法。" },
  { speaker: "404", node: "ch02_002_evidence_tutorial", text: "选择证据后，可以展示给指定人物。同一证据可能得到不同回答。" },
  { speaker: "404", node: "ch02_002_evidence_tutorial", text: "我只负责贴线索，不负责替你尴尬。" },
];

const zhouChatLines = [
  { speaker: "404", node: "ch02_003a_zhou_chat_response", text: "玩家把手机递过去。" },
  { speaker: "404", node: "ch02_003a_zhou_chat_response", text: "周砚川看了一会儿，视线停在时间上。" },
  { speaker: "玩家", node: "ch02_003a_zhou_chat_response", text: "有印象吗？" },
  { speaker: "周砚川", character: "zhou", node: "ch02_003a_zhou_chat_response", text: "房东催续租那晚。" },
  { speaker: "玩家", node: "ch02_003a_zhou_chat_response", text: "你怎么确定？" },
  { speaker: "周砚川", character: "zhou", expression: "frown", node: "ch02_003a_zhou_chat_response", text: "时间对得上。你把合同页打开过，但没有确认。" },
  { speaker: "周砚川", character: "zhou", node: "ch02_003a_zhou_chat_response", text: "你遇到长期决定，会先犹豫。要不要换房、要不要换工作……都会犹豫很久。" },
  { speaker: "玩家", node: "ch02_003a_zhou_chat_response", text: "……" },
  { speaker: "404", node: "ch02_003a_zhou_chat_response", text: "周砚川把手机还回来。" },
  { speaker: "周砚川", character: "zhou", expression: "embarrassed", node: "ch02_003a_zhou_chat_response", text: "如果是续租，我能解释前半句。后半句不像我的语气。", done: () => {
    state.shownChatToZhou = true;
    addClue("周砚川认为“今晚别忘了”指向续租、通勤和留在习惯城市的稳定生活决定。");
  } },
];

const linChatLines = [
  { speaker: "404", node: "ch02_003b_lin_chat_response", text: "玩家把聊天截图递给林夏。" },
  { speaker: "404", node: "ch02_003b_lin_chat_response", text: "林夏接过去，原本要开玩笑，看到时间后停了一下。" },
  { speaker: "林夏", character: "lin", node: "ch02_003b_lin_chat_response", text: "这个备注挺会添乱。" },
  { speaker: "玩家", node: "ch02_003b_lin_chat_response", text: "像你发的吗？" },
  { speaker: "林夏", character: "lin", node: "ch02_003b_lin_chat_response", text: "后半句像。" },
  { speaker: "玩家", node: "ch02_003b_lin_chat_response", text: "你当时在说什么？" },
  { speaker: "林夏", character: "lin", node: "ch02_003b_lin_chat_response", text: "买票去新城。你把确认页打开，又退回去。不止一次。" },
  { speaker: "玩家", node: "ch02_003b_lin_chat_response", text: "……" },
  { speaker: "林夏", character: "lin", node: "ch02_003b_lin_chat_response", text: "后来你开始算现在房子的押金、家具、早餐店，还有那家你其实只吃过两次的馄饨。" },
  { speaker: "玩家", node: "ch02_003b_lin_chat_response", text: "我连馄饨都要算？" },
  { speaker: "林夏", character: "lin", node: "ch02_003b_lin_chat_response", text: "你会。你对一座城市都会有愧疚感。", done: () => {
    state.shownChatToLin = true;
    addClue("林夏认为“今晚别忘了”指向新城市车票和一次真正离开的约定。");
  } },
];

const zhouStoryLines = [
  { speaker: "玩家", node: "ask_zhou_first_story", text: "我们是怎么认识的？" },
  { speaker: "周砚川", character: "zhou", node: "ask_zhou_first_story", text: "同栋楼。我住楼下。" },
  { speaker: "周砚川", character: "zhou", node: "ask_zhou_first_story", text: "一开始只是见过几次。同楼生活里那些小故障，你都碰到过。" },
  { speaker: "玩家", node: "ask_zhou_first_story", text: "听起来我和这栋楼关系不太好。" },
  { speaker: "周砚川", character: "zhou", expression: "embarrassed", node: "ask_zhou_first_story", text: "你当时也这么说。" },
  { speaker: "周砚川", character: "zhou", node: "ask_zhou_first_story", text: "真正熟起来，是门锁那次。" },
  { speaker: "周砚川", character: "zhou", expression: "frown", node: "ask_zhou_first_story", text: "你被锁在门外，物业电话没人接。我下班回来刚好路过。" },
  { speaker: "周砚川", character: "zhou", node: "ask_zhou_first_story", text: "那种门锁我处理过类似情况，就帮你打电话联系维修，也看了一下备用钥匙的问题。", done: () => {
    state.askedZhouStory = true;
    addClue("周砚川版本：同栋公寓近邻，关系真正变近来自门锁故障、备用钥匙和反复出现的生活问题。");
  } },
];

const linStoryLines = [
  { speaker: "玩家", node: "ask_lin_first_story", text: "我们是怎么认识的？" },
  { speaker: "林夏", character: "lin", node: "ask_lin_first_story", text: "你约我拍照。" },
  { speaker: "玩家", node: "ask_lin_first_story", text: "我主动找你的？" },
  { speaker: "林夏", character: "lin", node: "ask_lin_first_story", text: "嗯。你在平台上发来的需求很认真。" },
  { speaker: "玩家", node: "ask_lin_first_story", text: "我写了什么？" },
  { speaker: "林夏", character: "lin", node: "ask_lin_first_story", text: "“需要一组看起来没有班味的照片”。" },
  { speaker: "林夏", character: "lin", node: "ask_lin_first_story", text: "但本人到场以后更认真，站得像在等面试结果。" },
  { speaker: "玩家", node: "ask_lin_first_story", text: "所以没拍出来？" },
  { speaker: "林夏", character: "lin", node: "ask_lin_first_story", text: "怀疑我的技术？当然能拍出来。只不过比起那些我更喜欢抓拍的。" },
  { speaker: "林夏", character: "lin", expression: "serious", node: "ask_lin_first_story", text: "那张比前面十几张都好。很生活，很有趣。", done: () => {
    state.askedLinStory = true;
    addClue("林夏版本：第一次见面是一次“去班味”的生活化约拍，她记住的是玩家终于停止证明自己的瞬间。");
  } },
];

const keyToZhouMemoryLines = [
  { speaker: "404", node: "show_key_to_zhou_memory", text: "玩家把钥匙扣和便签放到桌上。" },
  { speaker: "玩家", node: "show_key_to_zhou_memory", text: "这个也是那次留下的？" },
  { speaker: "404", node: "show_key_to_zhou_memory", text: "周砚川看了一眼，手指在钥匙扣边缘停了停。" },
  { speaker: "周砚川", character: "zhou", expression: "embarrassed", node: "show_key_to_zhou_memory", text: "嗯。虽然你说丑，但你还是用了。" },
  { speaker: "404", node: "show_key_to_zhou_memory", text: "他没有继续解释，只看着便签上的字。" },
  { speaker: "周砚川", character: "zhou", expression: "frown", node: "show_key_to_zhou_memory", text: "那天你在门外站了很久。" },
  { speaker: "回忆", node: "zhou_door_lock_memory", text: "傍晚的楼道灯亮得有点慢。你一手拎着购买的生活用品，一手不算灵敏地按门锁。门锁发出很短的一声提示音，然后彻底安静。", memory: "zhou" },
  { speaker: "回忆", node: "zhou_door_lock_memory", text: "电梯在身后响了一声。周砚川从里面出来，肩上还背着下班的电脑包。", memory: "zhou" },
  { speaker: "玩家", node: "zhou_door_lock_memory", text: "不是吧……别装死，我知道你还有电。", memory: "zhou" },
  { speaker: "回忆", node: "zhou_door_lock_memory", text: "周砚川停在你旁边，看了一眼门锁的灯。", memory: "zhou" },
  { speaker: "周砚川", character: "zhou", node: "zhou_door_lock_memory", text: "没电了。", memory: "zhou" },
  { speaker: "玩家", node: "zhou_door_lock_memory", text: "它刚才还活着。没关系我有备用钥匙……", memory: "zhou" },
  { speaker: "回忆", node: "zhou_door_lock_memory", text: "你放下重重的购物袋，开始在身上所有的口袋翻找。", memory: "zhou" },
  { speaker: "周砚川", character: "zhou", node: "zhou_door_lock_memory", text: "这种型号断电前会提示。", memory: "zhou" },
  { speaker: "玩家", node: "zhou_door_lock_memory", text: "啊啊昨天还好好的，我记得这几天要换电池，但是老忘记……", memory: "zhou" },
  { speaker: "回忆", node: "zhou_door_lock_memory", text: "你找了一圈都没找到，逐渐开始觉得有些尴尬。", memory: "zhou" },
  { speaker: "玩家", node: "zhou_door_lock_memory", text: "完了好像没带……我还特地换了一个好看的钥匙扣方便找。", memory: "zhou" },
  { speaker: "回忆", node: "zhou_door_lock_memory", text: "周砚川拿出手机。", memory: "zhou" },
  { speaker: "周砚川", character: "zhou", node: "zhou_door_lock_memory", text: "我先帮你联系物业。这个我之前处理过一次。", memory: "zhou" },
  { speaker: "玩家", node: "zhou_door_lock_memory", text: "我声明一下，这不是我的问题。", memory: "zhou" },
  { speaker: "周砚川", character: "zhou", expression: "embarrassed", node: "zhou_door_lock_memory", text: "嗯。门锁的问题。", memory: "zhou" },
  { speaker: "周砚川", character: "zhou", expression: "frown", node: "zhou_door_lock_memory", text: "但备用钥匙怎么找都找不到，是你的问题。", memory: "zhou" },
  { speaker: "玩家", node: "zhou_door_lock_memory", text: "……", memory: "zhou" },
  { speaker: "周砚川", character: "zhou", node: "zhou_door_lock_memory", text: "而且钥匙扣太小。找起来会慢。", memory: "zhou" },
  { speaker: "玩家", node: "zhou_door_lock_memory", text: "这个时候就不要说我了吧？你专心处理门锁还是处理我的生活不良习惯？", memory: "zhou" },
  { speaker: "周砚川", character: "zhou", node: "zhou_door_lock_memory", text: "都在处理。", memory: "zhou" },
  { speaker: "回忆", node: "zhou_door_lock_memory", text: "维修电话接通前，楼道里只剩下门锁偶尔响一下。两个人之间的空气很安静。", memory: "zhou" },
  { speaker: "回忆", node: "zhou_door_lock_memory", text: "周砚川把你的生活用品接过去，放到不挡路的一边。你不死心，还在尝试触发电子锁。", memory: "zhou" },
  { speaker: "周砚川", character: "zhou", node: "zhou_door_lock_memory", text: "你先别一直按。电池仓可能锁死。", memory: "zhou" },
  { speaker: "回忆", node: "zhou_door_lock_memory", text: "周砚川从电脑包侧袋里翻出一个颜色很醒目的大钥匙扣。", memory: "zhou" },
  { speaker: "周砚川", character: "zhou", node: "zhou_door_lock_memory", text: "你能找到比较重要。推荐你换成这个。放心是我之前买的，不是公司送的。", memory: "zhou" },
  { speaker: "玩家", node: "zhou_door_lock_memory", text: "这也太额……那好看呢？", memory: "zhou" },
  { speaker: "周砚川", character: "zhou", expression: "embarrassed", node: "zhou_door_lock_memory", text: "排第二。", memory: "zhou" },
  { speaker: "周砚川", character: "zhou", node: "show_key_to_zhou_memory", text: "后来你还是一直用。我只是希望你回家的时候少站一会儿。看来的确有用。", done: () => {
    state.viewedZhouKeyMemory = true;
    state.askedZhouStory = true;
    addClue("周砚川版本：关系起点不是一句“他解决过一个问题”，而是一次门锁故障后的具体相处。");
  } },
];

const photoToLinMemoryLines = [
  { speaker: "404", node: "show_photo_to_lin_memory", text: "玩家把照片墙近景递给林夏。" },
  { speaker: "404", node: "show_photo_to_lin_memory", text: "林夏只扫了一眼，手指就停在其中一张边角翘起来的拍立得上。" },
  { speaker: "林夏", character: "lin", node: "show_photo_to_lin_memory", text: "这张你居然还留着。" },
  { speaker: "玩家", node: "show_photo_to_lin_memory", text: "所以是你拍的？" },
  { speaker: "林夏", character: "lin", node: "show_photo_to_lin_memory", text: "嗯。拍了一堆我最喜欢这张。" },
  { speaker: "回忆", node: "lin_photo_session_memory", text: "午后的街边橱窗反着光。你站在橱窗前，肩膀绷得很直，手不知道该放在哪里。", memory: "lin" },
  { speaker: "林夏", character: "lin", node: "lin_photo_session_memory", text: "你备注写的是“去班味、生活化一点”。不要这么尴尬。", memory: "lin" },
  { speaker: "玩家", node: "lin_photo_session_memory", text: "我已经尽量生活化了。", memory: "lin" },
  { speaker: "林夏", character: "lin", node: "lin_photo_session_memory", text: "你只是把手从身后放到了身前。", memory: "lin" },
  { speaker: "林夏", character: "lin", node: "lin_photo_session_memory", text: "肩膀放下来。", memory: "lin" },
  { speaker: "玩家", node: "lin_photo_session_memory", text: "我放下来了。", memory: "lin" },
  { speaker: "玩家", node: "lin_photo_session_memory", text: "我只是有点不知道怎么摆。", memory: "lin" },
  { speaker: "林夏", character: "lin", node: "lin_photo_session_memory", text: "别摆。你这样像机器人。", memory: "lin" },
  { speaker: "玩家", node: "lin_photo_session_memory", text: "你平时拍照都这么打击客户吗？", memory: "lin" },
  { speaker: "林夏", character: "lin", node: "lin_photo_session_memory", text: "不。我通常收费以后再打击。", memory: "lin" },
  { speaker: "玩家", node: "lin_photo_session_memory", text: "……", memory: "lin" },
  { speaker: "回忆", node: "lin_photo_session_memory", text: "林夏把相机放低一点，忍笑忍得很明显。", memory: "lin" },
  { speaker: "回忆", node: "lin_photo_session_memory", text: "玩家刚转头，风从街口吹过来。买的帽子往下滑，你下意识伸手去按，头发也被吹乱。", memory: "lin" },
  { speaker: "回忆", node: "lin_photo_session_memory", text: "快门声响了一下。", memory: "lin" },
  { speaker: "玩家", node: "lin_photo_session_memory", text: "等一下，刚才不算。", memory: "lin" },
  { speaker: "玩家", node: "lin_photo_session_memory", text: "你拍了？", memory: "lin" },
  { speaker: "林夏", character: "lin", node: "lin_photo_session_memory", text: "拍了。", memory: "lin" },
  { speaker: "玩家", node: "lin_photo_session_memory", text: "那张肯定不能用。", memory: "lin" },
  { speaker: "回忆", node: "lin_photo_session_memory", text: "林夏看着相机屏幕，笑意慢慢扩大。", memory: "lin" },
  { speaker: "玩家", node: "lin_photo_session_memory", text: "我刚才很狼狈。", memory: "lin" },
  { speaker: "林夏", character: "lin", expression: "serious", node: "lin_photo_session_memory", text: "嗯。这张像你。终于不像在证明什么了。恭喜你，班味减淡了。", memory: "lin" },
  { speaker: "玩家", node: "show_photo_to_lin_memory", text: "所以你把这些也贴出来？" },
  { speaker: "林夏", character: "lin", node: "show_photo_to_lin_memory", text: "前面那些是照片。" },
  { speaker: "玩家", node: "show_photo_to_lin_memory", text: "后面这些呢？" },
  { speaker: "林夏", character: "lin", node: "show_photo_to_lin_memory", text: "证据。" },
  { speaker: "玩家", node: "show_photo_to_lin_memory", text: "证明什么？" },
  { speaker: "林夏", character: "lin", expression: "serious", node: "show_photo_to_lin_memory", text: "证明你不用准备成另一个人，也值得被看见。" },
  { speaker: "404", node: "show_photo_to_lin_memory", text: "林夏停了一下，又把话收回去。" },
  { speaker: "林夏", character: "lin", node: "show_photo_to_lin_memory", text: "当然，也可能只是证明我职业素养不太稳定。", done: () => {
    state.viewedLinPhotoMemory = true;
    state.askedLinStory = true;
    addClue("林夏版本：关系起点来自一次“去班味”的生活化约拍，她记住的是玩家终于不像在证明自己的瞬间。");
  } },
];

const keyToLinLines = [
  { speaker: "404", node: "show_zhou_evidence_to_lin", text: "玩家把钥匙扣推到林夏面前。" },
  { speaker: "林夏", character: "lin", node: "show_zhou_evidence_to_lin", text: "先说结论，没见过。" },
  { speaker: "玩家", node: "show_zhou_evidence_to_lin", text: "答这么快？" },
  { speaker: "林夏", character: "lin", node: "show_zhou_evidence_to_lin", text: "因为它真的很难忘。如果我见过，会记得。" },
  { speaker: "玩家", node: "show_zhou_evidence_to_lin", text: "那周砚川那段不成立？" },
  { speaker: "404", node: "show_zhou_evidence_to_lin", text: "林夏用指尖拨了一下钥匙扣。" },
  { speaker: "林夏", character: "lin", node: "show_zhou_evidence_to_lin", text: "这个东西很像你会嫌丑，但最后又会一直用。" },
  { speaker: "玩家", node: "show_zhou_evidence_to_lin", text: "你没见过也能判断？" },
  { speaker: "林夏", character: "lin", node: "show_zhou_evidence_to_lin", text: "我没见过钥匙扣，但我见过你向实用丑东西妥协。" },
  { speaker: "周砚川", character: "zhou", node: "show_zhou_evidence_to_lin", text: "从实用性来说它很靠谱。", done: () => {
    state.shownKeyToLin = true;
    addClue("林夏不认识钥匙扣，但能准确判断玩家对它的反应。");
  } },
];

const albumToZhouLines = [
  { speaker: "404", node: "show_lin_evidence_to_zhou", text: "玩家把拍立得墙的照片递给周砚川。" },
  { speaker: "404", node: "show_lin_evidence_to_zhou", text: "周砚川看得比刚才久一点。" },
  { speaker: "周砚川", character: "zhou", expression: "frown", node: "show_lin_evidence_to_zhou", text: "我没见过这面墙。但照片不像假的。" },
  { speaker: "玩家", node: "show_lin_evidence_to_zhou", text: "凭什么判断？" },
  { speaker: "周砚川", character: "zhou", node: "show_lin_evidence_to_zhou", text: "角度不对。" },
  { speaker: "周砚川", character: "zhou", node: "show_lin_evidence_to_zhou", text: "不像监控，也不像偷拍。" },
  { speaker: "404", node: "show_lin_evidence_to_zhou", text: "周砚川把其中一张放大。" },
  { speaker: "周砚川", character: "zhou", expression: "embarrassed", node: "show_lin_evidence_to_zhou", text: "拍照的人在等你放松。", done: () => {
    state.shownAlbumToZhou = true;
    addClue("周砚川不认识这面照片墙，但承认照片不像伪造，像拍照的人熟悉玩家放松下来的样子。");
  } },
];

const endingLines = [
  { speaker: "玩家", node: "ch02_010_chapter_end", text: "如果只是有人撒谎，为什么能留下这么多痕迹？" },
  { speaker: "周砚川", character: "zhou", node: "ch02_010_chapter_end", text: "所以不能只问人。" },
  { speaker: "林夏", character: "lin", node: "ch02_010_chapter_end", text: "也不能只看物。物也会偏心。" },
  { speaker: "玩家", node: "ch02_010_chapter_end", text: "物怎么偏心？" },
  { speaker: "林夏", character: "lin", expression: "teasing", node: "ch02_010_chapter_end", text: "你看，钥匙偏他，照片偏我。" },
  { speaker: "周砚川", character: "zhou", node: "ch02_010_chapter_end", text: "日历偏向冲突。" },
  { speaker: "404", node: "ch02_010_chapter_end", text: "记录板上，钥匙扣、照片墙和实体日历被贴在同一排。" },
  { speaker: "404", node: "ch02_010_chapter_end", text: "它们都很具体，具体到不像谎言。" },
  { speaker: "404", node: "ch02_010_chapter_end", text: "也具体到更难判断。" },
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
const choiceStack = document.querySelector(".choice-stack");
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

if (sceneCard && choiceStack && choiceStack.parentElement !== sceneCard) {
  sceneCard.appendChild(choiceStack);
}

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
  speaker.textContent = displaySpeakerName(line.speaker);
  dialoguePanel.classList.toggle("is-narration", !line.character && displaySpeakerName(line.speaker) === "叙述");
  nodeLabel.textContent = "";
  dialogueText.textContent = line.text;
  setDialogueStandees();
  updateExpression(line);
  updateStandeeFocus(line.character || null);
  updateTopbarState();
  recordDialogueLine();
  if (line.done) line.done();
}

function displaySpeakerName(name) {
  if (name === "玩家") return "我";
  if (name === "回忆" || name === "404") return "叙述";
  return name;
}

function setDialogueStandees() {
  zhouPanel.src = standeeAssets.zhou.neutral;
  linPanel.src = standeeAssets.lin.neutral;
  zhouPanel.dataset.expression = "neutral";
  linPanel.dataset.expression = "neutral";
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
        : "抽屉第二层确实有备用钥匙。旁边有一个大钥匙扣，颜色很显眼，审美很难评价。你把钥匙扣拿起来，塑料边缘被磨得有点发亮，说明它不是刚被放进去的道具。压在下面的便签字迹很直：“门锁电池换过了。备用钥匙别再放第二层，太好猜。”",
    },
    album: {
      node: "ch02_006_album_zoom",
      text: state.evidence.has("album")
        ? "这面照片墙已经记录过。"
        : "墙上夹着一组拍立得，旁边贴着几张浅色便签。前几张像是约拍时留下的构图，光线干净，物件也摆得很稳。再往后，画面忽然松下来。钥匙、比心的手、没吃完的冰淇淋、玩偶和随手拍下的街角混在一起。这些照片不像宣传照，更像某个人在旁边忍不住多按了几次快门。",
    },
    calendar: {
      node: "ch02_007_calendar_zoom",
      text: state.evidence.has("calendar")
        ? "同一晚两座城市的日历冲突已经记录过。"
        : "书架上的实体日历停在昨天。同一个日期格里，被两种颜色的笔写得有点挤。一边是续租、通勤、留下来的清单。另一边是新城、车票、出发前确认。两种笔迹压在同一个小格子里，像谁都不肯让出那一晚。",
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
      { speaker: "周砚川", character: "zhou", node: "ch02_009_second_deduction", text: "证据仍然有冲突。" },
    ],
    info: [
      { speaker: "404", node: "ch02_009_second_deduction", text: "阶段判断已记录：存在信息利用可能。" },
      { speaker: "周砚川", character: "zhou", node: "ch02_009_second_deduction", text: "需要继续排除。" },
      { speaker: "林夏", character: "lin", node: "ch02_009_second_deduction", text: "这个说法听起来很吓人，但也不是没道理。" },
    ],
    split: [
      { speaker: "404", node: "ch02_009_second_deduction", text: "阶段判断已记录：故事版本异常。" },
      { speaker: "404", node: "ch02_009_second_deduction", text: "提示：这不是结论，只是一个更麻烦的问题。" },
      { speaker: "周砚川", character: "zhou", node: "ch02_009_second_deduction", text: "继续查。" },
      { speaker: "林夏", character: "lin", node: "ch02_009_second_deduction", text: "嗯。虽然我开始不喜欢这个方向了。" },
    ],
  };
  closeEvidence();
  startLinear([...feedback[judge], ...endingLines], finishChapter);
}

function finishChapter() {
  state.mode = "complete";
  chapterGoal.textContent = "第二章完成";
  renderLine({ speaker: "404", node: "chapter_02_complete", text: "第二章记录已归档。第三章已解锁。" });
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
    node: nodeForMode(),
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

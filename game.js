(() => {
  "use strict";

  const SAVE_KEY = "dunhuang-four-seasons-save-v1";
  const META_KEY = "dunhuang-four-seasons-archive-v1";
  const SOUND_KEY = "dunhuang-four-seasons-sound-v1";
  const SAVE_VERSION = 1;
  const STAT_KEYS = ["grain", "coin", "morale", "defense", "culture"];
  const STAT_LABELS = {
    grain: "仓廪",
    coin: "公帑",
    morale: "民心",
    defense: "城防",
    culture: "文教",
  };
  const MOD_LABELS = {
    irrigation: "渠堰",
    market: "商路",
    watch: "烽戍",
    school: "学舍",
  };

  const seasons = [
    {
      name: "春 · 启耕",
      glyph: "春",
      weather: "东南风",
      rumor: "春雪初融，西来的驼队正在阳关外等候入城。",
      tags: ["春耕加成", "商旅渐多"],
    },
    {
      name: "夏 · 引水",
      glyph: "夏",
      weather: "晴热少雨",
      rumor: "雪水顺祁连山下泄，几处渠口因争水挤满了农人。",
      tags: ["水渠吃紧", "夏税开征"],
    },
    {
      name: "秋 · 纳赋",
      glyph: "秋",
      weather: "西风扬沙",
      rumor: "秋熟入仓，边军催问本季军饷与冬衣。",
      tags: ["秋收加成", "军费将至"],
    },
    {
      name: "冬 · 守烽",
      glyph: "冬",
      weather: "朔风飞雪",
      rumor: "远处烽燧的红光在暮色中一再亮起，驿骑连夜入城。",
      tags: ["城防加成", "冬储消耗"],
    },
  ];

  const actions = [
    {
      id: "farm",
      name: "疏渠垦荒",
      icon: "渠",
      description: "修整旧渠，招民开垦城郊荒地。",
      effects: { grain: 8, coin: -5, morale: 2 },
      seasonBonus: { grain: [3, 2, 5, -2] },
      mods: { irrigation: 1 },
    },
    {
      id: "market",
      name: "开市招商",
      icon: "市",
      description: "减收临时市税，引商旅入城交易。",
      effects: { coin: 4, morale: 3, culture: 1 },
      seasonBonus: { coin: [0, 1, 2, -3] },
      mods: { market: 1 },
    },
    {
      id: "patrol",
      name: "募卒巡塞",
      icon: "骑",
      description: "增募熟悉道路的边卒，巡查关隘。",
      effects: { defense: 10, coin: -9, morale: 2 },
      seasonBonus: { defense: [0, 1, 0, 3] },
      mods: { watch: 1 },
    },
    {
      id: "wall",
      name: "葺城置烽",
      icon: "烽",
      description: "修补城墙，并添置烽铺柴薪。",
      effects: { defense: 7, coin: -7 },
      seasonBonus: { defense: [0, 2, 1, 5] },
      mods: { watch: 1 },
    },
    {
      id: "relief",
      name: "平粜赈济",
      icon: "粟",
      description: "以官仓平抑粮价，赈济孤寡与流民。",
      effects: { grain: -7, morale: 10, culture: 2 },
      seasonBonus: { morale: [1, 0, 2, 4] },
      mods: {},
    },
    {
      id: "school",
      name: "兴学译经",
      icon: "文",
      description: "资助学舍与译经，让各族子弟同堂。",
      effects: { culture: 9, coin: -8, morale: 3 },
      seasonBonus: { culture: [1, 0, 2, 1] },
      mods: { school: 1 },
    },
    {
      id: "relay",
      name: "整驿通商",
      icon: "驿",
      description: "补强驿站车马，缩短文书与商队行程。",
      effects: { coin: -4, defense: 5, culture: 2 },
      seasonBonus: { defense: [0, 0, 1, 2] },
      mods: { market: 1 },
    },
    {
      id: "lowtax",
      name: "轻徭薄赋",
      icon: "宽",
      description: "暂缓部分杂役与市税，让百姓休养。",
      effects: { coin: -9, morale: 9, grain: 2 },
      seasonBonus: { morale: [1, 0, 1, 4] },
      mods: {},
    },
    {
      id: "audit",
      name: "巡市稽税",
      icon: "核",
      description: "核验关市凭证，补征漏税与违规货值。",
      effects: { coin: 12, morale: -5, defense: 1 },
      seasonBonus: { coin: [0, 1, 2, -3] },
      mods: {},
    },
    {
      id: "recruit",
      name: "犒军募勇",
      icon: "勇",
      description: "补足军饷，招募熟悉沙碛的本地勇卒。",
      effects: { defense: 6, coin: -10, morale: -2 },
      seasonBonus: { defense: [0, 1, 0, 3] },
      mods: { watch: 1 },
    },
    {
      id: "community",
      name: "巡访闾巷",
      icon: "访",
      description: "走进坊巷听民声，以少量文书安定人心。",
      effects: { morale: 5, culture: 1, defense: 1 },
      seasonBonus: { morale: [1, 0, 1, 2] },
      mods: {},
    },
  ];

  const events = [
    {
      id: "caravan",
      title: "驼铃入城",
      type: "市易",
      symbol: "驼",
      caption: "丝路商旅",
      tone: "sand",
      story:
        "一支粟特商队自西而来。领队递上略显破旧的过所，请求在城中多停五日，并希望减免入市税。随行货物里有香料、玻璃器与良马；守门卒则担心其中夹带未报关的兵器。",
      history:
        "唐代商旅过关津通常须持官府凭证，市易亦受关市制度稽查。沙州处在河西走廊通往西域的要道上，商队、使者与僧侣的往来，使这里既是贸易节点，也是多方信息交汇之地。",
      source: "制度参考：《唐六典》关津与关市条；敦煌社会经济文书研究通识。",
      unlock: ["sys-guosuo"],
      choices: [
        {
          label: "依例验牒，照章征税",
          detail: "先查凭证与货物，按定例收入市税。",
          effects: { coin: 9, morale: -2, culture: 2 },
          resultTitle: "关市有序",
          resultText:
            "验牒耗费半日，商队最终获准停留。守门卒收起戒心，州府也多了一笔可用的市税；只是商旅私下议论，敦煌的门槛比邻州更高。",
        },
        {
          label: "设互市，减税招商",
          detail: "给出五日互市便利，换取长期商路。",
          effects: { coin: -3, morale: 5, culture: 3 },
          mods: { market: 1 },
          resultTitle: "驼铃远去，商路初开",
          resultText:
            "商队在西市支起帐篷，城中人第一次见到那样透明的玻璃器。眼前少收了几枚税钱，往后的商旅却记住了沙州这座愿意打开城门的绿洲。",
        },
        {
          label: "只许官营，尽收其利",
          detail: "由州府统购货物，再转售于城内。",
          effects: { coin: 12, morale: -7, culture: -1 },
          mods: { market: -1 },
          resultTitle: "利归官署",
          resultText:
            "官署确实得了厚利，城内铺户却失去了与商队直接议价的机会。人们遵守命令，也在茶馆里低声抱怨：关市像一道只朝州府打开的窄门。",
        },
      ],
    },
    {
      id: "water",
      title: "渠水之争",
      type: "农事",
      symbol: "水",
      caption: "绿洲水脉",
      tone: "water",
      story:
        "雪水涌下，几条农田渠同时请求加灌。军屯说麦苗误不得，城郊农户则指出上渠豪族私自截流。渠长带着旧水册来见，请你定下今夏的用水次序。",
      history:
        "敦煌绿洲的农业依赖祁连山雪水。渠道需要民众共同维护，灌溉次序、渠社组织与用水规约，往往直接关乎收成、赋役和乡村秩序；敦煌文献中保留了大量相关线索。",
      source: "制度参考：敦煌本《水部式》残卷；唐代敦煌渠社与绿洲农业研究通识。",
      unlock: ["sys-water"],
      choices: [
        {
          label: "昼夜轮灌，设渠长监督",
          detail: "按田亩与水册分配，派渠长巡看渠口。",
          effects: { coin: -6, grain: 8, morale: 6 },
          mods: { irrigation: 1 },
          resultTitle: "水到田头",
          resultText:
            "轮灌的第一夜，渠长提着灯从上游走到下游。有人嫌规定太慢，却没有人再能公然截水。新立的木牌记着各渠时辰，也记着州府第一次把公平写进水道。",
        },
        {
          label: "军屯优先，保边粮",
          detail: "让军田先用足水，再放给民田。",
          effects: { grain: 11, defense: 3, morale: -8 },
          resultTitle: "军田无虞，民心起波",
          resultText:
            "军屯按时播下，仓廪的底数更稳妥。下游民田却因来水太迟毁了一成苗。戍边有功，百姓也明白轻重，但被牺牲的那几户人家，不会轻易忘记这一季。",
        },
        {
          label: "交由乡里自决",
          detail: "让渠社按旧约商议，官府暂不介入。",
          effects: { coin: 3, grain: 2, morale: -4 },
          resultTitle: "乡议难平",
          resultText:
            "乡老们争到日暮，仍未说服上游豪族。州府省下开支，也把最难的那一部分公正交还给了强者。旧水册被翻得卷边，渠口却依旧比谁家的田更早开闸。",
        },
      ],
    },
    {
      id: "pay",
      title: "秋赋与军饷",
      type: "军费",
      symbol: "饷",
      caption: "边军岁支",
      tone: "iron",
      story:
        "节度使衙门的军吏来催秋饷。名册上有新募的边卒，也有久戍未归的老兵。州府账面吃紧，而秋税尚未全部到仓，几名商人也正等待新的税令。",
      history:
        "天宝时期，边疆常驻军规模扩大，军费与地方财赋之间的联系更加紧密，节度使兼掌军政事务的趋势加强。军饷是否足额，不只是钱粮问题，也影响戍卒与地方之间的信任。",
      source: "制度参考：《旧唐书·职官志》《新唐书·兵志》及唐代军费研究通识。",
      unlock: ["sys-pay", "sys-army"],
      choices: [
        {
          label: "足额支给，不欠边卒",
          detail: "先拨公帑补足，再设法追回秋税。",
          effects: { coin: -13, defense: 9, morale: 2 },
          resultTitle: "军心稍定",
          resultText:
            "军吏点清最后一串钱，名单上的名字被逐一划去。州府库房一下子空了许多，戍卒却知道，这道冬风里有人记得他们的饷。",
        },
        {
          label: "加征商税，转补军费",
          detail: "向大商队征收临时军需税。",
          effects: { coin: 8, defense: 4, morale: -7 },
          mods: { market: -1 },
          resultTitle: "钱有了，商路窄了",
          resultText:
            "几家大商队缴了税，边饷暂时有了着落。消息传出去后，下一支商队改道去了别处。公帑渡过眼前难关，城门外的车辙却比往年浅了。",
        },
        {
          label: "轮番休戍，省下一成",
          detail: "裁减冗员，让部分老兵短暂归乡。",
          effects: { coin: 7, defense: -6, morale: 4 },
          mods: { watch: -1 },
          resultTitle: "省饷有余，烽戍见疏",
          resultText:
            "老兵们终于踏上回乡路，州府也缓了一口气。可烽铺少了熟手，夜里换哨的间隔变长。节省下来的每一成军费，都在城防上留下了一道不易察觉的缺口。",
        },
      ],
    },
    {
      id: "beacon",
      title: "烽火误报",
      type: "边警",
      symbol: "烽",
      caption: "烽燧传警",
      tone: "iron",
      story:
        "入夜，北面第三座烽燧突然举火，全城守军披甲上墙。两刻钟后，驿骑回报：只是戍卒误把风沙中的落日当作火光，传号时又沿用了前次的烽式。",
      history:
        "烽燧是边疆传警体系的一环，依靠固定的信号、路线与值守纪律传递消息。一次误报可能虚耗军力，一次漏报则可能延误防备，因此烽号训练与文书稽查都十分重要。",
      source: "制度参考：《唐六典·兵部》及唐代烽燧、驿传制度研究通识。",
      unlock: ["sys-beacon"],
      choices: [
        {
          label: "严明烽号，按律责罚",
          detail: "整编烽铺章程，惩戒当值失职者。",
          effects: { coin: -8, defense: 9, morale: -3 },
          mods: { watch: 1 },
          resultTitle: "烽号重立",
          resultText:
            "新的烽式被抄成小册，送到每一座烽铺。失职戍卒受了罚，营中空气一时凝重。此后夜里，每一次火光都要经两处复核，误报减少了，抱怨也多了。",
        },
        {
          label: "宽宥戍卒，加固传警",
          detail: "不重罚误报者，把经费用在联络驿骑上。",
          effects: { coin: -10, defense: 5, morale: 4 },
          mods: { watch: 1, market: 1 },
          resultTitle: "人心与耳目俱安",
          resultText:
            "误报的年轻戍卒没有受刑，他主动抄写了整夜的烽谱。新添的快马往返于烽铺与州城之间，消息多走了一步，城头便少了一次无谓的惊惶。",
        },
        {
          label: "不究旧案，省下开支",
          detail: "将此事记作风沙所致，暂时不动军费。",
          effects: { coin: 7, defense: -9, morale: -2 },
          resultTitle: "省下一笔，留下隐忧",
          resultText:
            "州府省下了修缮与训练的钱。有人说这只是一次小错，但烽铺里的旧号仍无人校正。下一场风沙来时，没有人敢保证，城墙上的人还能分辨真正的火光。",
        },
      ],
    },
    {
      id: "refugees",
      title: "城外来客",
      type: "民生",
      symbol: "民",
      caption: "流民求食",
      tone: "sand",
      story:
        "邻州旱情加重，百余户人家带着孩子和牲畜来到城下。里正担心口粮与治安，商队则愿意雇其中壮劳力。城外的人群既不喧哗，也不肯散去。",
      history:
        "人口迁移与户籍、赋役、赈济制度彼此关联。对边城而言，流民既可能是新的劳动力和商路服务者，也可能在仓廪不足时加重治安与分配压力；安置方式需要同时考虑短期救济与长期生计。",
      source: "制度参考：唐代户籍、赈恤与地方治理研究通识；敦煌户籍文书资料。",
      unlock: ["sys-tax"],
      choices: [
        {
          label: "开仓赈济，登记安置",
          detail: "先供七日口粮，再按丁口编入城郊。",
          effects: { grain: -14, morale: 12, culture: 3 },
          resultTitle: "城门之内皆为子民",
          resultText:
            "粮仓少了一层，城郊多了许多临时屋棚。登记册写满了陌生的乡名，孩子们在渠边学着说沙州话。七日以后，有人找到活计，也有人仍在等待。",
        },
        {
          label: "限额赈济，以工代赈",
          detail: "只救济老弱，壮丁修渠换粮。",
          effects: { grain: -7, coin: -4, morale: 5, culture: 2 },
          mods: { irrigation: 1 },
          resultTitle: "一餐换一工",
          resultText:
            "壮丁被编入修渠队，老弱每日领一碗粥。秩序得以维持，工程也推进了一段。有人赞同这样的安排，也有人发现，饥饿的人并没有太多选择的余地。",
        },
        {
          label: "闭门自守，先保城中",
          detail: "发放少量路引，要求来客转向邻县。",
          effects: { grain: 4, coin: 3, morale: -13, defense: 2 },
          resultTitle: "城门紧闭",
          resultText:
            "守卒合上城门，城内粮价暂未上涨。可城墙并不隔绝声音，城外彻夜有人敲着陶碗。第二日清晨，州府门口堆着几封请愿的短笺。",
        },
      ],
    },
    {
      id: "standards",
      title: "奇货与秤",
      type: "市易",
      symbol: "秤",
      caption: "度量衡",
      tone: "sand",
      story:
        "西市出现了一批成色极好的香料，商贩称重时却用了两套不同的小秤。买主发现分量不一，市场一时骚动。大商人愿意捐一尊铜秤，但希望在秤座上刻下自家名号。",
      history:
        "唐代城市市场设有管理官员，关市、物价和度量衡都受官府监督。公平称量不仅是消费纠纷，也是税基、商誉与市场秩序的基础。边地市场多族群交易频繁，更依赖可共同信任的规则。",
      source: "制度参考：《唐六典》太府寺与市署职掌；唐代市场制度研究通识。",
      unlock: ["sys-guosuo"],
      choices: [
        {
          label: "设官市平权衡",
          detail: "校验各铺秤具，以官定标准统一秤量。",
          effects: { coin: -4, morale: 4, culture: 4 },
          mods: { market: 1 },
          resultTitle: "一杆公秤",
          resultText:
            "铜秤立在市署门前，所有人当众校验。商贩第一天抱怨生意慢了，第二天却发现争执少了不少。秤上没有官印，却刻着所有铺户都认得的规矩。",
        },
        {
          label: "采买奇货，献于上峰",
          detail: "包下香料，作为年礼送入州府。",
          effects: { coin: -10, culture: 8, morale: 1 },
          resultTitle: "香气进了官署",
          resultText:
            "奇货被仔细装箱，官吏得了体面的年礼。市井的秤却仍各用各的，争执在几日后再次出现。香气能遮住一时的不快，遮不住称量时那半钱的差距。",
        },
        {
          label: "放任私贩，先抽商税",
          detail: "维持交易热度，只按摊位收税。",
          effects: { coin: 12, morale: -5, defense: -2 },
          mods: { market: -1 },
          resultTitle: "市声喧腾",
          resultText:
            "摊位费当天收齐，香料很快售罄。城里的市场看起来格外热闹，买主却开始自带小秤。表面的繁荣被计入税册，不信任则悄悄留在每一次讨价还价里。",
        },
      ],
    },
    {
      id: "school",
      title: "学舍与译经",
      type: "文教",
      symbol: "文",
      caption: "多语沙州",
      tone: "water",
      story:
        "城中寺院愿借出一间空房设学舍，教授童蒙汉字，也为往来商旅翻译契约。寺院请州府助一笔纸墨钱；军械库则说，这笔钱原本可以用来换一批箭镞。",
      history:
        "敦煌长期是不同族群、语言与宗教文化交汇的地方，佛教寺院、学舍与书写传统在当地社会生活中占有重要位置。识字、契约与翻译能力，也服务于丝路商业和基层治理。",
      source: "制度参考：敦煌文献、敦煌石窟与唐代地方文化研究通识。",
      unlock: ["sys-culture"],
      choices: [
        {
          label: "州府助印，公开讲学",
          detail: "拨出纸墨钱，让学舍向商旅子弟开放。",
          effects: { coin: -10, culture: 12, morale: 4 },
          mods: { school: 1 },
          resultTitle: "灯火照见新字",
          resultText:
            "学舍在黄昏点起第一盏灯。有人写下自己的名字，有人学会辨认契约中的数字。纸墨很贵，灯油也要省着用，但沙州多了一处不只属于官署的声音。",
        },
        {
          label: "先修军械，暂缓文教",
          detail: "将钱拨给军械库，保障冬防。",
          effects: { coin: -3, defense: 11, culture: -3 },
          resultTitle: "箭镞先于纸墨",
          resultText:
            "一箱新箭镞进了军械库，学舍的空房仍没有挂上匾额。边城确实需要先守住城门，可守在门内的人若只识兵器不识契约，市场与官府之间的误会也会越来越多。",
        },
        {
          label: "公私合办，商旅助学",
          detail: "请商会分担纸墨，换取译契服务。",
          effects: { coin: -5, culture: 8, morale: 2 },
          mods: { school: 1, market: 1 },
          resultTitle: "一纸多语",
          resultText:
            "商会认领了纸墨，学舍则替商人翻译契约。州府花费不多，却让教育与市井彼此靠近。有人担心铜钱会左右课堂，至少这一季，更多孩子拿起了笔。",
        },
      ],
    },
    {
      id: "snowstorm",
      title: "丝路风雪",
      type: "边警",
      symbol: "雪",
      caption: "风雪救援",
      tone: "iron",
      story:
        "一场暴雪封住西去的道路。驿骑带回消息：一支商队在三十里外的避风墩受困，其中有使者、商人，也有从西州返乡的百姓。城中冬储有限，夜色已经压下来。",
      history:
        "河西走廊交通深受风雪、沙碛与水源影响。驿传和沿途烽戍不仅传递军情，也为官方交通提供补给与救助；对商旅的救援，往往同时关系到人命、贸易信誉与边地治安。",
      source: "制度参考：唐代驿传、烽燧与河西交通研究通识。",
      unlock: ["sys-relay"],
      choices: [
        {
          label: "发粮遣骑，连夜救援",
          detail: "取城中冬储与快马，赶赴避风墩。",
          effects: { coin: -9, grain: -6, morale: 10, culture: 3 },
          mods: { market: 1 },
          resultTitle: "灯从雪里来",
          resultText:
            "救援队在雪停前找到商队。几名冻伤的人被抬回城中，货物损失过半，却没有人再继续埋在风里。此后数年，行商仍会说起那夜城头为他们多留的一盏灯。",
        },
        {
          label: "守城为先，等待风停",
          detail: "保留粮马，不许城门冒险开启。",
          effects: { grain: 4, coin: 3, morale: -9 },
          resultTitle: "风停了，人没有回来",
          resultText:
            "天亮后，风势渐缓，避风墩却再无炊烟。城中粮储完好，守军也无损伤。城门口很快恢复通行，却少了一支本该带来驼铃、书信和新故事的人。",
        },
        {
          label: "募勇赏金，军民同救",
          detail: "出重赏募集熟悉沙碛的向导与壮丁。",
          effects: { coin: -13, defense: 4, morale: 6, culture: 1 },
          mods: { market: 1 },
          resultTitle: "雪线之上，人人成卒",
          resultText:
            "向导、兵卒与两名牧人结队出发。重赏买来了勇氣，熟悉道路的人则买回了大家。商队最后只损失了部分货物，州府也第一次看清，守城不只是墙上的事。",
        },
      ],
    },
  ];

  const archiveEntries = [
    {
      id: "sys-sha",
      category: "system",
      title: "沙州与河西走廊",
      body:
        "唐沙州以敦煌为中心，处河西走廊西端，连接中原、西域与青藏高原方向的道路。天宝元年（742），唐廷改州为郡，沙州在行政上称敦煌郡；本作沿用“沙州”这一读者更熟悉的旧称。",
      source: "参考：《旧唐书·地理志》《新唐书·地理志》。",
    },
    {
      id: "sys-guosuo",
      category: "system",
      title: "过所与关市",
      body:
        "唐代商旅通过关津、州界时通常需要相应凭证，关市交易也受官府稽查。边地市场既要保证人流货物流通，也要防止走私、逃税与夹带违禁物。",
      source: "参考：《唐六典》关津、关市相关职掌；敦煌社会经济文书研究。",
    },
    {
      id: "sys-army",
      category: "system",
      title: "边军与节度使",
      body:
        "天宝时期，边疆常驻军规模扩大，节度使在地方军政事务中的权力增强。府兵之外，募兵和职业边卒的重要性上升，财政、兵籍与地方治理因此联系得更紧。",
      source: "参考：《新唐书·兵志》《旧唐书·职官志》。",
    },
    {
      id: "sys-pay",
      category: "system",
      title: "军费从何而来",
      body:
        "边军粮饷、冬衣、马料与器械都依赖地方财赋和转运。税源不足时，官府可能加征、挪用或缩减军费；每一种办法都会在军队、商旅与百姓之间形成不同后果。",
      source: "参考：唐代军费与河西财政研究通识。",
    },
    {
      id: "sys-tax",
      category: "system",
      title: "户籍、赋役与赈济",
      body:
        "唐代赋役与土地、户籍密切相关。敦煌保存了不少籍帐、契约等文书，让我们能看见基层家庭、田亩与差役的实际运作。赈济流民不仅是慈善问题，也关乎编户和治安。",
      source: "参考：敦煌户籍与赋役文书研究通识。",
    },
    {
      id: "sys-relay",
      category: "system",
      title: "驿传与交通",
      body:
        "驿馆承担公文传递、使者接待和交通补给等职责。路线上的车马、粮料与住宿安排，使驿传成为帝国行政的神经；边地驿路的通畅也直接影响商旅安全。",
      source: "参考：《唐六典》兵部、驾部相关记载；唐代驿传研究。",
    },
    {
      id: "sys-beacon",
      category: "system",
      title: "烽燧传警",
      body:
        "烽燧通过烟火、旗帜等约定信号分段传递军情。准确传警依赖值守纪律、固定烽式与驿骑核验；边地风沙和人的误判，都可能让一次警戒变成虚惊。",
      source: "参考：《唐六典·兵部》及唐代敦煌烽燧研究通识。",
    },
    {
      id: "sys-water",
      category: "system",
      title: "绿洲与渠水",
      body:
        "敦煌绿洲依赖祁连山雪水灌溉。渠道的修护、分水次序和地方组织关系到农收与赋役。敦煌发现的《水部式》残卷，为理解唐代水利管理提供了重要材料。",
      source: "参考：敦煌本《水部式》残卷；唐代渠社研究。",
    },
    {
      id: "sys-culture",
      category: "system",
      title: "多语交汇的沙州",
      body:
        "敦煌是商旅、僧侣、使者与不同族群长期交汇之地。寺院、学舍、写经和石窟艺术，构成了层次丰富的地方文化。识字与翻译能力也直接服务于市场契约和基层治理。",
      source: "参考：敦煌文献与敦煌石窟研究通识。",
    },
    {
      id: "place-market",
      category: "place",
      title: "市署",
      body:
        "市署是管理市场事务的官署，职责包括稽查交易、监督度量衡等。边城市场由本地商贩与往来商旅共同构成，制度执行得好，公信与税源才可能同时增长。",
      source: "史鉴新录：市署 · 关市制度。",
    },
    {
      id: "place-post",
      category: "place",
      title: "驿馆",
      body:
        "驿馆是驿路上的重要节点，负责接待公务使者、传递文书并补充车马粮料。边地驿路越可靠，朝廷消息、军情和地方事务就越不容易被延误。",
      source: "史鉴新录：驿馆 · 驿传制度。",
    },
    {
      id: "place-school",
      category: "place",
      title: "学舍",
      body:
        "地方学舍不只是读书场所，也承担文字教育、礼仪与地方文化传承。商旅频繁的沙州，识字与翻译能帮助人们理解契约、文告和彼此的语言。",
      source: "史鉴新录：学舍 · 地方文教。",
    },
    {
      id: "place-canal",
      category: "place",
      title: "渠堰",
      body:
        "绿洲农业仰赖山雪融水。渠道需要按季修浚、按序放水，渠口和水册是基层治理的重要工具。一条水渠维系的不只是农田，也包括村庄之间的合作与争执。",
      source: "史鉴新录：渠堰 · 绿洲水利。",
    },
    {
      id: "place-beacon",
      category: "place",
      title: "烽燧",
      body:
        "烽燧多依地势而建，负责远距离观察与传警。守烽者需要识别约定信号，并与驿骑、所城相互确认。它是一套系统，不只是一位守卒和一堆柴薪。",
      source: "史鉴新录：烽燧 · 边地军防。",
    },
    {
      id: "ev-caravan",
      category: "event",
      title: "驼队、过所与信任",
      body:
        "一支商队的去留，背后是关市稽查、税收和商路信誉的共同作用。短期多征未必等于长期多得，少收税也不必然能换来长期商路，关键在于规则是否可预期。",
      source: "事件史鉴：唐关市制度与丝路贸易。",
    },
    {
      id: "ev-water",
      category: "event",
      title: "谁先打开渠口",
      body:
        "分水次序是绿洲治理的核心难题。军粮、民田与豪族利益相互牵制，官府若完全退出，公平未必自动出现；若只凭权力分配，也可能损害长期信任。",
      source: "事件史鉴：敦煌绿洲水利与地方组织。",
    },
    {
      id: "ev-pay",
      category: "event",
      title: "秋赋与边饷",
      body:
        "军费安排会把商税、农业与边军信誉连成一个循环。足额军饷稳固军心，但需要稳定财源；临时加征能救急，也可能改变商旅选择与地方税基。",
      source: "事件史鉴：天宝时期边军与地方财政。",
    },
    {
      id: "ev-beacon",
      category: "event",
      title: "一次烽火误报",
      body:
        "误报考验的不仅是奖惩，更是信号系统的容错能力。严刑可能减少失误，却未必解决传号规则本身的问题；增加核验环节，则会消耗更多人手与经费。",
      source: "事件史鉴：烽燧信号与边军训练。",
    },
    {
      id: "ev-refugees",
      category: "event",
      title: "赈济之外的长期生计",
      body:
        "赈济能应对眼前饥饿，却无法单独解决流民安置。以工代赈、编入户籍或转向邻县，都是历史与现实都可能出现的治理选择，各自牵动粮储、劳动力与地方认同。",
      source: "事件史鉴：户籍制度与赈恤。",
    },
    {
      id: "ev-standards",
      category: "event",
      title: "一杆秤的公信",
      body:
        "统一度量衡减少交易成本，也保护官府税收。市场规范不是天然存在的，需要明确标准、执行成本与可被买卖双方理解的规则；一次公平称量能积累长期信誉。",
      source: "事件史鉴：唐代市署与度量衡监督。",
    },
    {
      id: "ev-school",
      category: "event",
      title: "纸墨与箭镞",
      body:
        "边城预算总在安全与文化之间竞争。文教支出不像军备那样立刻可见，却能培养识字吏员、降低契约纠纷，并让不同语言的人群拥有共同沟通的基础。",
      source: "事件史鉴：敦煌文教与多语社会。",
    },
    {
      id: "ev-snowstorm",
      category: "event",
      title: "雪线之下的公共责任",
      body:
        "河西交通受风雪制约，驿传和烽戍既是军事设施，也是公共救援网络。是否为一支困在城外的商队出兵，考验的是有限资源下如何定义一座边城的责任。",
      source: "事件史鉴：唐代驿传与河西交通。",
    },
  ];

  const placeFacts = {
    market: {
      index: "地志 · 壹",
      title: "市署",
      text:
        "市署负责稽查关市与度量衡。对沙州而言，公平的秤与明确的税则，比一时的热闹更能养活一条商路。",
      archiveId: "place-market",
    },
    post: {
      index: "地志 · 贰",
      title: "驿馆",
      text:
        "驿馆往来奔驰的并不只是文书，也有使者和军情。车马、草料与传递密码共同维持着边城与朝廷的联系。",
      archiveId: "place-post",
    },
    school: {
      index: "地志 · 叁",
      title: "学舍",
      text:
        "不同语言的商旅子弟若能在同一堂识字，契约会少些争执。纸墨的钱不显眼，却可以积累很久。",
      archiveId: "place-school",
    },
    canal: {
      index: "地志 · 肆",
      title: "渠堰",
      text:
        "山上的雪水是沙州的命脉。水册和渠长构成的秩序，让军屯与民田不必每到夏天就用锄头争夺水源。",
      archiveId: "place-canal",
    },
    beacon: {
      index: "地志 · 伍",
      title: "烽燧",
      text:
        "一座烽燧看见的远方有限，但许多烽燧连起来，就能让边城比风沙更早知道危险。准确比迅速更难。",
      archiveId: "place-beacon",
    },
  };

  const statMeta = {
    grain: { label: "仓廪", className: "grain" },
    coin: { label: "公帑", className: "coin" },
    morale: { label: "民心", className: "morale" },
    defense: { label: "城防", className: "defense" },
    culture: { label: "文教", className: "culture" },
  };

  const els = {};
  let state = null;
  let activeArchiveFilter = "all";
  let activeEvent = null;
  let soundEnabled = loadPreference(SOUND_KEY, true);
  let audioContext = null;
  let toastTimer = null;

  function cacheElements() {
    const ids = [
      "titleScreen",
      "gameScreen",
      "resultScreen",
      "startButton",
      "continueButton",
      "titleAboutButton",
      "homeButton",
      "helpButton",
      "soundButton",
      "archiveButton",
      "archiveCount",
      "yearLabel",
      "seasonGlyph",
      "seasonName",
      "seasonDots",
      "weatherBadge",
      "grainValue",
      "coinValue",
      "moraleValue",
      "defenseValue",
      "cultureValue",
      "grainBar",
      "coinBar",
      "moraleBar",
      "defenseBar",
      "cultureBar",
      "irrigationMod",
      "marketMod",
      "watchMod",
      "schoolMod",
      "turnStatus",
      "objectivePercent",
      "objectiveBar",
      "mapSeasonGlyph",
      "mapHintButton",
      "mapInfo",
      "mapInfoClose",
      "mapInfoIndex",
      "mapInfoTitle",
      "mapInfoText",
      "rumorText",
      "seasonTags",
      "chronicleFeed",
      "viewLogButton",
      "apSeal",
      "policyTipText",
      "policyGrid",
      "apHint",
      "endTurnButton",
      "saveState",
      "eventModal",
      "eventCloseButton",
      "eventVisual",
      "eventSymbol",
      "eventVisualCaption",
      "eventSeason",
      "eventType",
      "eventTitle",
      "eventStory",
      "eventChoices",
      "eventResult",
      "eventResultTitle",
      "eventResultText",
      "eventEffects",
      "eventHistoryText",
      "eventSourceText",
      "settlementLines",
      "eventContinueButton",
      "archiveModal",
      "archiveCloseButton",
      "archiveHeaderCount",
      "archiveTotalCount",
      "archiveGrid",
      "helpModal",
      "helpCloseButton",
      "helpStartButton",
      "logModal",
      "logCloseButton",
      "logList",
      "aboutModal",
      "aboutCloseButton",
      "aboutConfirmButton",
      "toastStack",
      "resultSeal",
      "resultTitle",
      "resultSubtitle",
      "resultScore",
      "resultStats",
      "achievementList",
      "resultLesson",
      "replayButton",
      "resultArchiveButton",
      "resultHomeButton",
      "archiveResultCount",
    ];
    ids.forEach((id) => {
      els[id] = document.getElementById(id);
    });
  }

  function loadPreference(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      if (value === null) return fallback;
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  function savePreference(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Local preferences are optional.
    }
  }

  function loadMetaUnlocked() {
    try {
      const parsed = JSON.parse(localStorage.getItem(META_KEY) || "[]");
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((id) => archiveEntries.some((entry) => entry.id === id));
    } catch {
      return [];
    }
  }

  function saveMetaUnlocked(ids) {
    try {
      localStorage.setItem(META_KEY, JSON.stringify([...new Set(ids)]));
    } catch {
      // Discovery history is optional.
    }
  }

  function randomSeed() {
    if (window.crypto && typeof window.crypto.getRandomValues === "function") {
      const buffer = new Uint32Array(1);
      window.crypto.getRandomValues(buffer);
      return buffer[0] || Date.now();
    }
    return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
  }

  function seededShuffle(items, seed) {
    const copy = [...items];
    let value = seed >>> 0;
    const random = () => {
      value += 0x6d2b79f5;
      let result = value;
      result = Math.imul(result ^ (result >>> 15), result | 1);
      result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
      return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
    };
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const next = Math.floor(random() * (index + 1));
      [copy[index], copy[next]] = [copy[next], copy[index]];
    }
    return copy;
  }

  function createEventOrder(seed) {
    const middle = events.filter((event) => event.id !== "caravan" && event.id !== "snowstorm");
    return ["caravan", ...seededShuffle(middle, seed + 97).map((event) => event.id), "snowstorm"];
  }

  function initialUnlocked() {
    const meta = loadMetaUnlocked();
    return [...new Set(["sys-sha", "sys-guosuo", ...meta])];
  }

  function freshState() {
    const seed = randomSeed();
    const next = {
      version: SAVE_VERSION,
      seed,
      turn: 0,
      stats: {
        grain: 60,
        coin: 60,
        morale: 62,
        defense: 55,
        culture: 40,
      },
      mods: {
        irrigation: 0,
        market: 0,
        watch: 0,
        school: 0,
      },
      actionPoints: 2,
      usedActions: [],
      candidates: [],
      eventOrder: createEventOrder(seed),
      phase: "actions",
      failed: false,
      archiveUnlocked: initialUnlocked(),
      logs: [
        {
          date: "天宝元年 · 春",
          title: "赴任沙州",
          text: "初至边城。城中百业待兴，八季考成自此始。",
        },
      ],
      lastEventResult: null,
      completed: false,
    };
    next.candidates = generateCandidates(next);
    return next;
  }

  function yearLabel(turn) {
    return `天宝${turn < 4 ? "元" : "二"}年`;
  }

  function turnDate(turn) {
    return `${yearLabel(turn)} · ${seasons[turn % 4].glyph}`;
  }

  function getCurrentEvent() {
    const eventId = state.eventOrder[state.turn];
    return events.find((event) => event.id === eventId) || events[0];
  }

  function generateCandidates(customState = state) {
    const seasonIndex = customState.turn % 4;
    const byId = Object.fromEntries(actions.map((action) => [action.id, action]));
    const chosen = [];

    const incomeOptions = ["market", "audit", "lowtax"];
    const incomeId = incomeOptions[seasonIndex % incomeOptions.length];
    chosen.push(incomeId);

    const seasonalPriority = seasonIndex === 0 ? "farm" : seasonIndex === 3 ? "wall" : seasonIndex === 1 ? "relay" : "relief";
    chosen.push(seasonalPriority);

    if (customState.stats.coin < 16) {
      chosen.push("community");
    } else {
      chosen.push("community");
    }

    if (customState.stats.culture < 55) chosen.push("school");
    if (customState.stats.defense < 65) chosen.push("patrol");
    if (customState.stats.grain < 45) chosen.push("farm");

    const randomRest = seededShuffle(
      actions.filter((action) => !chosen.includes(action.id)),
      customState.seed + customState.turn * 389 + 17,
    );
    randomRest.forEach((action) => {
      if (chosen.length < 7) chosen.push(action.id);
    });

    return [...new Set(chosen)].slice(0, 7).map((id) => byId[id].id);
  }

  function adjustEffects(action) {
    const effects = { ...action.effects };
    const seasonIndex = state.turn % 4;
    Object.entries(action.seasonBonus || {}).forEach(([key, values]) => {
      effects[key] = (effects[key] || 0) + (values[seasonIndex] || 0);
    });
    return effects;
  }

  function applyEffects(effects = {}, mods = {}, options = {}) {
    const changedStats = [];
    STAT_KEYS.forEach((key) => {
      const amount = Number(effects[key] || 0);
      if (!amount) return;
      const before = state.stats[key];
      state.stats[key] = clamp(before + amount, 0, 100);
      if (state.stats[key] !== before) changedStats.push(key);
    });

    Object.entries(mods).forEach(([key, amount]) => {
      if (!(key in state.mods) || !amount) return;
      state.mods[key] = clamp(state.mods[key] + amount, 0, 4);
    });

    if (changedStats.length && options.animate !== false) {
      changedStats.forEach((key) => bumpResource(key));
    }
    return changedStats;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function effectChips(effects = {}, mods = {}, context = "policy") {
    const chips = [];
    STAT_KEYS.forEach((key) => {
      const amount = Math.round(Number(effects[key] || 0));
      if (!amount) return;
      chips.push({
        text: `${STAT_LABELS[key]} ${signed(amount)}`,
        tone: amount > 0 ? "positive" : "negative",
      });
    });
    Object.entries(mods || {}).forEach(([key, amount]) => {
      if (!amount) return;
      chips.push({
        text: `${MOD_LABELS[key]} ${signed(amount)}`,
        tone: "special",
      });
    });
    return chips
      .map((chip) => {
        if (context === "event") {
          return `<span class="${chip.tone}">${escapeHtml(chip.text)}</span>`;
        }
        return `<span class="effect-chip ${chip.tone}">${escapeHtml(chip.text)}</span>`;
      })
      .join("");
  }

  function signed(amount) {
    return amount > 0 ? `+${amount}` : String(amount);
  }

  function effectSummary(effects = {}, mods = {}) {
    const pieces = [];
    STAT_KEYS.forEach((key) => {
      const amount = Math.round(Number(effects[key] || 0));
      if (amount) pieces.push(`${STAT_LABELS[key]}${signed(amount)}`);
    });
    Object.entries(mods || {}).forEach(([key, amount]) => {
      if (amount) pieces.push(`${MOD_LABELS[key]}${signed(amount)}`);
    });
    return pieces.join(" · ");
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function startNewGame() {
    state = freshState();
    hideAllScreens();
    els.gameScreen.classList.remove("hidden");
    renderAll();
    saveState();
    playSound("start");
    showToast("已至沙州。每季先颁两道政令，再迎候时局。");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function continueSavedGame() {
    const restored = readSavedState();
    if (!restored) {
      showToast("旧案无法读取，已为你新开一局。");
      startNewGame();
      return;
    }
    state = restored;
    if (!state.candidates?.length || state.phase !== "actions") {
      if (state.phase === "actions") state.candidates = generateCandidates(state);
    }
    hideAllScreens();
    els.gameScreen.classList.remove("hidden");
    renderAll();
    if (state.phase === "result" && state.lastEventResult) {
      const event = events.find((item) => item.id === state.lastEventResult.eventId);
      if (event) {
        openEventModal(event);
        renderEventResult(event);
      }
    } else {
      showToast(`${turnDate(state.turn)} · 旧案已续。`);
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function readSavedState() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed.version !== SAVE_VERSION) return null;
      if (
        !Number.isInteger(parsed.turn) ||
        parsed.turn < 0 ||
        parsed.turn > 7 ||
        !parsed.stats ||
        !parsed.mods ||
        !Array.isArray(parsed.eventOrder)
      ) {
        return null;
      }
      STAT_KEYS.forEach((key) => {
        parsed.stats[key] = clamp(Number(parsed.stats[key]) || 0, 0, 100);
      });
      parsed.archiveUnlocked = Array.isArray(parsed.archiveUnlocked) ? parsed.archiveUnlocked : initialUnlocked();
      parsed.logs = Array.isArray(parsed.logs) ? parsed.logs : [];
      parsed.usedActions = Array.isArray(parsed.usedActions) ? parsed.usedActions : [];
      parsed.actionPoints = clamp(Number(parsed.actionPoints) || 0, 0, 2);
      return parsed;
    } catch {
      return null;
    }
  }

  function saveState() {
    if (!state || state.completed) return;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
      if (els.saveState) {
        els.saveState.textContent = "进度已保存";
      }
    } catch {
      if (els.saveState) {
        els.saveState.textContent = "本次进度未能保存";
      }
    }
    refreshContinueButton();
  }

  function clearSavedState() {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      // Ignore storage clearing failures.
    }
    refreshContinueButton();
  }

  function hasSavedState() {
    return Boolean(localStorage.getItem(SAVE_KEY));
  }

  function refreshContinueButton() {
    const saved = hasSavedState();
    els.continueButton.classList.toggle("hidden", !saved);
    els.startButton.querySelector("span").textContent = saved ? "另开新局" : "赴任沙州";
  }

  function hideAllScreens() {
    els.titleScreen.classList.add("hidden");
    els.gameScreen.classList.add("hidden");
    els.resultScreen.classList.add("hidden");
  }

  function showTitle() {
    closeAllModals();
    hideAllScreens();
    els.titleScreen.classList.remove("hidden");
    refreshContinueButton();
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function renderAll() {
    if (!state) return;
    renderHeader();
    renderStats();
    renderModifiers();
    renderPolicies();
    renderSeasonCopy();
    renderArchiveCount();
    renderChronicle();
    renderSaveLabel();
  }

  function renderHeader() {
    const season = seasons[state.turn % 4];
    els.yearLabel.textContent = yearLabel(state.turn);
    els.seasonGlyph.textContent = season.glyph;
    els.seasonName.textContent = season.name;
    els.mapSeasonGlyph.textContent = season.glyph;
    els.weatherBadge.textContent = season.weather;
    els.turnStatus.textContent = `第 ${state.turn + 1} / 8 季`;
    els.objectivePercent.textContent = `${Math.round((state.turn / 8) * 100)}%`;
    els.objectiveBar.style.width = `${(state.turn / 8) * 100}%`;
    els.seasonDots.innerHTML = "";
    for (let index = 0; index < 8; index += 1) {
      const dot = document.createElement("span");
      dot.className = "season-dot";
      if (index < state.turn) dot.classList.add("done");
      if (index === state.turn) dot.classList.add("current");
      dot.setAttribute("aria-label", `第${index + 1}季${index === state.turn ? "，当前" : ""}`);
      els.seasonDots.appendChild(dot);
    }
  }

  function renderStats(changed = []) {
    STAT_KEYS.forEach((key) => {
      const value = Math.round(state.stats[key]);
      const valueEl = els[`${key}Value`];
      const barEl = els[`${key}Bar`];
      if (valueEl) valueEl.textContent = value;
      if (barEl) barEl.style.width = `${clamp(value, 0, 100)}%`;
      const meter = barEl?.parentElement;
      if (meter) meter.setAttribute("aria-valuenow", value);
      const row = document.querySelector(`.resource-row[data-resource="${key}"]`);
      if (row && changed.includes(key)) {
        row.classList.remove("is-bumped");
        requestAnimationFrame(() => row.classList.add("is-bumped"));
      }
    });
  }

  function bumpResource(key) {
    const row = document.querySelector(`.resource-row[data-resource="${key}"]`);
    if (!row) return;
    row.classList.remove("is-bumped");
    requestAnimationFrame(() => row.classList.add("is-bumped"));
  }

  function renderModifiers() {
    els.irrigationMod.textContent = state.mods.irrigation;
    els.marketMod.textContent = state.mods.market;
    els.watchMod.textContent = state.mods.watch;
    els.schoolMod.textContent = state.mods.school;
  }

  function renderSeasonCopy() {
    const season = seasons[state.turn % 4];
    els.rumorText.textContent = season.rumor;
    els.seasonTags.innerHTML = season.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
  }

  function renderPolicies() {
    const seasonIndex = state.turn % 4;
    const currentSeason = seasons[seasonIndex];
    els.apSeal.textContent = chineseNumber(state.actionPoints);
    els.apHint.textContent = state.actionPoints > 0 ? `尚余 ${state.actionPoints} 道` : "政令已足";
    els.policyTipText.textContent = `${currentSeason.glyph}季每道政令的特殊效果已经计入。选择两张，为本季定下取舍。`;
    els.endTurnButton.disabled = state.actionPoints !== 0;
    els.endTurnButton.firstChild.textContent =
      state.actionPoints === 0 ? "颁行完毕 · 迎候时局 " : `再颁 ${state.actionPoints} 道政令 `;

    els.policyGrid.innerHTML = "";
    state.candidates.forEach((id) => {
      const action = actions.find((item) => item.id === id);
      if (!action) return;
      const effects = adjustEffects(action);
      const used = state.usedActions.includes(action.id);
      const insufficient =
        (effects.coin < 0 && state.stats.coin + effects.coin < 0) ||
        (effects.grain < 0 && state.stats.grain + effects.grain < 0);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "policy-card";
      button.dataset.actionId = action.id;
      button.disabled = used || state.actionPoints === 0 || insufficient;
      if (used) button.classList.add("used");
      if (insufficient && !used) button.classList.add("insufficient");
      const costParts = [];
      if (effects.coin < 0) costParts.push(`耗公帑 ${Math.abs(effects.coin)}`);
      if (effects.grain < 0) costParts.push(`支粮 ${Math.abs(effects.grain)}`);
      if (!costParts.length) costParts.push("不需现支");
      button.innerHTML = `
        <span class="policy-top">
          <span class="policy-icon" aria-hidden="true">${escapeHtml(action.icon)}</span>
          <span class="policy-cost ${costParts[0] === "不需现支" ? "free" : ""}">${escapeHtml(costParts.join(" · "))}</span>
        </span>
        <span class="policy-name">${escapeHtml(action.name)}</span>
        <span class="policy-desc">${escapeHtml(action.description)}</span>
        <span class="policy-effects">${effectChips(effects, action.mods, "policy")}</span>
      `;
      button.setAttribute(
        "aria-label",
        `${action.name}。${action.description} 效果：${effectSummary(effects, action.mods)}`,
      );
      button.addEventListener("click", (event) => choosePolicy(action, event));
      els.policyGrid.appendChild(button);
    });
  }

  function chineseNumber(number) {
    return ["零", "壹", "贰"][number] || String(number);
  }

  function choosePolicy(action, event) {
    if (!state || state.actionPoints <= 0 || state.usedActions.includes(action.id)) return;
    const effects = adjustEffects(action);
    if (
      (effects.coin < 0 && state.stats.coin + effects.coin < 0) ||
      (effects.grain < 0 && state.stats.grain + effects.grain < 0)
    ) {
      showToast(effects.coin < 0 ? "公帑不足，无法颁行此令。" : "仓廪不足，无法颁行此令。");
      playSound("error");
      return;
    }

    const anchorRect = event.currentTarget.getBoundingClientRect();
    applyEffects(effects, action.mods, { animate: false });
    state.actionPoints -= 1;
    state.usedActions.push(action.id);
    addLog(
      turnDate(state.turn),
      `颁令 · ${action.name}`,
      effectSummary(effects, action.mods) || "政令已行，静待时局。",
    );
    renderStats(STAT_KEYS.filter((key) => Number(effects[key])));
    renderModifiers();
    renderPolicies();
    renderChronicle();
    saveState();
    playSound("policy");
    showFloatingAt(
      anchorRect.left + anchorRect.width / 2,
      anchorRect.top + 24,
      effectSummary(effects, action.mods),
      STAT_KEYS.some((key) => Number(effects[key]) < 0),
    );
  }

  function addLog(date, title, text) {
    state.logs.push({ date, title, text });
    if (state.logs.length > 40) state.logs = state.logs.slice(-40);
  }

  function renderChronicle() {
    const latest = state.logs[state.logs.length - 1];
    els.chronicleFeed.textContent = latest ? latest.text : "尚无案牍。";
  }

  function renderSaveLabel() {
    if (state.phase === "result") {
      els.saveState.textContent = "本季决议已存";
    } else {
      els.saveState.textContent = "进度自动保存";
    }
  }

  function openCurrentEvent() {
    if (!state || state.phase !== "actions") return;
    if (state.actionPoints > 0) {
      showToast(`还须再颁 ${state.actionPoints} 道政令，方可迎候时局。`);
      playSound("error");
      return;
    }
    const event = getCurrentEvent();
    activeEvent = event;
    openEventModal(event);
  }

  function openEventModal(event) {
    activeEvent = event;
    els.eventModal.classList.remove("hidden");
    document.body.classList.add("modal-open");
    els.eventCloseButton.classList.add("hidden");
    els.eventResult.classList.add("hidden");
    els.eventChoices.classList.remove("hidden");
    els.eventChoices.innerHTML = "";
    els.eventVisual.dataset.tone = event.tone || "sand";
    els.eventSymbol.textContent = event.symbol;
    els.eventVisualCaption.textContent = event.caption;
    els.eventSeason.textContent = turnDate(state.turn);
    els.eventType.textContent = `${event.type} · 第 ${state.turn + 1} 季`;
    els.eventTitle.textContent = event.title;
    els.eventStory.textContent = event.story;
    els.eventHistoryText.textContent = event.history;
    els.eventSourceText.textContent = event.source;

    event.choices.forEach((choice, index) => {
      const effects = choice.effects || {};
      const mods = choice.mods || {};
      const insufficient =
        (effects.coin < 0 && state.stats.coin + effects.coin < 0) ||
        (effects.grain < 0 && state.stats.grain + effects.grain < 0);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "event-choice";
      button.disabled = insufficient;
      button.innerHTML = `
        <span class="event-choice-text">
          <b>${escapeHtml(choice.label)}</b>
          <small>${escapeHtml(choice.detail)}${insufficient ? " · 当前资源不足" : ""}</small>
        </span>
        <span class="event-choice-effects">${effectChips(effects, mods, "event")}</span>
      `;
      button.addEventListener("click", () => chooseEventOption(event, choice, index));
      els.eventChoices.appendChild(button);
    });

    els.eventChoices.querySelector("button:not(:disabled)")?.focus();
  }

  function chooseEventOption(event, choice, index) {
    if (!state || state.phase !== "actions") return;
    const effects = choice.effects || {};
    const mods = choice.mods || {};
    applyEffects(effects, mods, { animate: false });
    const settlement = settleSeason();
    const newUnlocks = [...(event.unlock || []), `ev-${event.id}`];
    unlockArchive(newUnlocks, false);
    state.phase = "result";
    state.failed = STAT_KEYS.some((key) => state.stats[key] <= 0);
    state.lastEventResult = {
      eventId: event.id,
      choiceIndex: index,
      choiceLabel: choice.label,
      resultTitle: choice.resultTitle,
      resultText: choice.resultText,
      effects,
      mods,
      settlement,
      failed: state.failed,
    };
    addLog(
      turnDate(state.turn),
      `决断 · ${event.title}`,
      `${choice.label}。${effectSummary(effects, mods)}`,
    );
    addLog(turnDate(state.turn), "岁计", settlement.map((line) => `${line.label}${signed(line.amount)}`).join(" · "));
    renderAll();
    renderEventResult(event);
    saveState();
    playSound("decision");
  }

  function renderEventResult(event) {
    const result = state.lastEventResult;
    if (!result) return;
    const choice = event.choices[result.choiceIndex];
    els.eventChoices.classList.add("hidden");
    els.eventResult.classList.remove("hidden");
    els.eventResultTitle.textContent = result.resultTitle;
    els.eventResultText.textContent = result.resultText;
    els.eventEffects.innerHTML = effectChips(result.effects, result.mods, "event");
    els.eventHistoryText.textContent = event.history;
    els.eventSourceText.textContent = event.source;
    els.eventType.textContent = `${event.type} · ${turnDate(state.turn)}`;
    els.settlementLines.innerHTML = result.settlement
      .map(
        (line) =>
          `<span><b>${escapeHtml(line.label)}</b> <span class="${line.amount > 0 ? "positive" : line.amount < 0 ? "negative" : ""}">${signed(line.amount)}</span></span>`,
      )
      .join("");
    if (result.failed) {
      els.settlementLines.insertAdjacentHTML(
        "beforeend",
        '<span><b>城局</b> <span class="negative">五事失衡，城务陷入危机</span></span>',
      );
    }
    els.eventContinueButton.innerHTML =
      state.turn >= 7 || result.failed
        ? '呈报本任考成 <span aria-hidden="true">→</span>'
        : '进入下一季 <span aria-hidden="true">→</span>';
    els.eventContinueButton.onclick = advanceAfterEvent;
    els.eventContinueButton.focus();
  }

  function settleSeason() {
    const seasonIndex = state.turn % 4;
    const lines = [];
    const liveMorale = state.stats.morale;
    const coinIncome = 4 + state.mods.market * 2 + Math.floor(liveMorale / 28);
    const coinUpkeep = 2 + Math.floor(state.stats.defense / 38);
    const coinNet = coinIncome - coinUpkeep;
    const grainBase = [1, 0, 5, -2][seasonIndex];
    const grainNet = grainBase + state.mods.irrigation * 2 + (seasonIndex === 3 && state.mods.watch > 0 ? 1 : 0);
    const moraleNet =
      (state.mods.school > 0 ? 1 : 0) +
      (liveMorale >= 70 ? 1 : 0) -
      (state.stats.coin < 20 ? 2 : 0) -
      (state.stats.grain < 20 ? 1 : 0);
    const defenseNet = state.mods.watch > 0 ? 0 : -1;
    const cultureNet = state.mods.school > 0 ? 0 : -1;

    const changes = {
      coin: { label: "商税与岁入", amount: coinNet },
      grain: { label: "农收与廪食", amount: grainNet },
      morale: { label: "民心自然变化", amount: moraleNet },
      defense: { label: "戍守折耗", amount: defenseNet },
      culture: { label: "文教传承", amount: cultureNet },
    };
    STAT_KEYS.forEach((key) => {
      const line = changes[key];
      const before = state.stats[key];
      state.stats[key] = clamp(before + line.amount, 0, 100);
      lines.push(line);
    });
    return lines.filter((line) => line.amount !== 0);
  }

  function advanceAfterEvent() {
    if (!state) return;
    if (state.failed || state.turn >= 7) {
      finishGame();
      return;
    }
    state.turn += 1;
    state.actionPoints = 2;
    state.usedActions = [];
    state.phase = "actions";
    state.lastEventResult = null;
    state.candidates = generateCandidates(state);
    closeAllModals();
    renderAll();
    saveState();
    playSound("season");
    const season = seasons[state.turn % 4];
    showToast(`${yearLabel(state.turn)} · ${season.glyph}季已至。${season.rumor}`);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function finishGame() {
    if (!state) return;
    state.completed = true;
    state.phase = "complete";
    const score = calculateScore();
    const rank = getRank(score, state.failed);
    const achievements = getAchievements();
    unlockArchive(state.archiveUnlocked, true);
    clearSavedState();
    closeAllModals();
    hideAllScreens();
    els.resultScreen.classList.remove("hidden");
    els.resultSeal.textContent = rank.glyph;
    els.resultTitle.textContent = rank.title;
    els.resultSubtitle.textContent = rank.subtitle;
    els.resultScore.textContent = score;
    els.resultStats.innerHTML = STAT_KEYS.map(
      (key) =>
        `<div class="result-stat"><b>${Math.round(state.stats[key])}</b><span>${STAT_LABELS[key]}</span></div>`,
    ).join("");
    els.achievementList.innerHTML = achievements
      .map((achievement) => `<span class="achievement">${escapeHtml(achievement)}</span>`)
      .join("");
    els.resultLesson.textContent = buildFinalLesson(achievements, rank);
    els.archiveResultCount.textContent = `已收录 ${state.archiveUnlocked.length} / ${archiveEntries.length} 则史鉴`;
    window.scrollTo({ top: 0, behavior: "instant" });
    playSound(state.failed ? "failure" : "victory");
  }

  function calculateScore() {
    const statsScore = STAT_KEYS.reduce((sum, key) => sum + Math.round(state.stats[key]), 0);
    const modsScore = Object.values(state.mods).reduce((sum, value) => sum + value, 0) * 9;
    const archiveScore = state.archiveUnlocked.length * 4;
    const failedPenalty = state.failed ? 120 : 0;
    return Math.max(0, statsScore + modsScore + archiveScore - failedPenalty);
  }

  function getRank(score, failed) {
    if (failed) {
      return {
        glyph: "危",
        title: "危城待复",
        subtitle: "一季失衡，未必是终局；读懂代价，才是下一任的开始。",
      };
    }
    if (score >= 590) {
      return {
        glyph: "名",
        title: "丝路名臣",
        subtitle: "商旅识其名，戍卒感其惠；五事相济，绿洲生辉。",
      };
    }
    if (score >= 500) {
      return {
        glyph: "良",
        title: "安边良牧",
        subtitle: "风沙未掩市声，烽烟未惊炊烟。",
      };
    }
    if (score >= 420) {
      return {
        glyph: "守",
        title: "守成之臣",
        subtitle: "沙州未坠，百姓得安；有余地，也仍有可为。",
      };
    }
    if (score >= 340) {
      return {
        glyph: "勤",
        title: "勤恳州吏",
        subtitle: "诸事未必尽善，八季案牍却已留下你的笔迹。",
      };
    }
    return {
      glyph: "砺",
      title: "待砺之吏",
      subtitle: "边城仍在，旧案未销；每一处疏漏都可成为下一任的起点。",
    };
  }

  function getAchievements() {
    const achievements = [];
    if (state.mods.market >= 3) achievements.push("商路繁盛");
    if (state.mods.irrigation >= 3) achievements.push("绿洲水足");
    if (state.stats.defense >= 75 && state.mods.watch >= 2) achievements.push("烽燧无惊");
    if (state.stats.culture >= 70 && state.mods.school >= 2) achievements.push("庠序有声");
    if (state.stats.morale >= 80) achievements.push("万家安定");
    if (state.stats.grain >= 80) achievements.push("仓廪丰实");
    if (STAT_KEYS.every((key) => state.stats[key] >= 55)) achievements.push("五事兼济");
    if (state.archiveUnlocked.length >= Math.ceil(archiveEntries.length / 2)) achievements.push("好古敏求");
    if (!achievements.length) achievements.push("八季守城");
    return achievements;
  }

  function buildFinalLesson(achievements, rank) {
    if (state.failed) {
      return "粮、钱、民心、城防与文教彼此牵制：任何一项归零，都可能让其余努力失去支点。历史的治理难题，很少能靠一次正确选择一劳永逸。";
    }
    if (rank.title === "丝路名臣") {
      return "一座边城的繁荣，不是某一项数字的胜利。稳定的商路、可用的水渠、能被听见的民声和可信的边防，共同把绿洲变成了可以抵达的地方。";
    }
    if (state.mods.market >= 3 && state.mods.irrigation >= 2) {
      return "商路与水利让沙州同时获得流动与根基。历史上的丝路城镇，正依赖这种开放与地方生计之间的相互支撑。";
    }
    if (state.mods.school >= 2 && achievements.includes("好古敏求")) {
      return "你在治城之余留下了许多史鉴。制度并非冷冰冰的条文，它总在具体的人、货物、水渠与烽火中显出重量。";
    }
    if (state.stats.morale >= 70) {
      return "民心不是一枚可以随时兑现的筹码。它来自一次次分配是否公平、承诺是否兑现，以及官府是否愿意看见城门外的那些人。";
    }
    if (state.stats.defense >= 70) {
      return "边城先要守住，却不能只靠城墙。军饷、烽号与驿路把防御延伸到很远的地方；可靠的信息和信任，同样是防线的一部分。";
    }
    return "历史中的地方官总在有限资源里做选择。没有一项政策只产生一种后果，也没有一座城能只依靠一项长项长久安稳。";
  }

  function unlockArchive(ids, quiet = false) {
    if (!state) return;
    const before = new Set(state.archiveUnlocked);
    const valid = [...new Set(ids)].filter(
      (id) => archiveEntries.some((entry) => entry.id === id) && !before.has(id),
    );
    state.archiveUnlocked.push(...valid);
    saveMetaUnlocked([...loadMetaUnlocked(), ...valid]);
    renderArchiveCount();
    if (valid.length && !quiet) {
      const title = archiveEntries.find((entry) => entry.id === valid[0])?.title;
      showToast(`史鉴新录 · ${title}`);
      playSound("archive");
    }
    if (valid.length && state.phase !== "complete") saveState();
  }

  function renderArchiveCount() {
    if (!state) return;
    els.archiveCount.textContent = state.archiveUnlocked.length;
    els.archiveHeaderCount.textContent = state.archiveUnlocked.length;
    els.archiveTotalCount.textContent = archiveEntries.length;
  }

  function openMapPlace(placeKey) {
    const fact = placeFacts[placeKey];
    if (!fact) return;
    els.mapInfo.classList.remove("hidden");
    els.mapInfoIndex.textContent = fact.index;
    els.mapInfoTitle.textContent = fact.title;
    els.mapInfoText.textContent = fact.text;
    unlockArchive([fact.archiveId]);
    playSound("map");
  }

  function openArchive() {
    if (!state) return;
    closeAllModals();
    renderArchive(activeArchiveFilter);
    els.archiveModal.classList.remove("hidden");
    document.body.classList.add("modal-open");
    els.archiveCloseButton.focus();
  }

  function renderArchive(filter = "all") {
    activeArchiveFilter = filter;
    document.querySelectorAll(".archive-tab").forEach((tab) => {
      const active = tab.dataset.archiveTab === filter;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", String(active));
    });
    const unlockedSet = new Set(state.archiveUnlocked);
    const entries = archiveEntries.filter((entry) => filter === "all" || entry.category === filter);
    const typeLabels = { system: "制度", place: "地志", event: "事件" };
    els.archiveGrid.innerHTML = entries
      .map((entry, index) => {
        const unlocked = unlockedSet.has(entry.id);
        if (!unlocked) {
          return `
            <article class="archive-entry locked">
              <span class="locked-mark">待</span>
              <b>尚未收录</b>
              <small>${typeLabels[entry.category]} · ${entry.category === "event" ? "经历时局后可录" : "点访城坊或经历相关事件后可录"}</small>
            </article>
          `;
        }
        return `
          <article class="archive-entry">
            <div class="archive-entry-top">
              <span class="archive-type">${typeLabels[entry.category]}</span>
              <span class="archive-entry-index">${String(index + 1).padStart(2, "0")}</span>
            </div>
            <h3>${escapeHtml(entry.title)}</h3>
            <p>${escapeHtml(entry.body)}</p>
            <small>${escapeHtml(entry.source)}</small>
          </article>
        `;
      })
      .join("");
  }

  function openHelp() {
    closeAllModals();
    els.helpModal.classList.remove("hidden");
    document.body.classList.add("modal-open");
    els.helpStartButton.focus();
  }

  function openLog() {
    if (!state) return;
    closeAllModals();
    els.logList.innerHTML = state.logs.length
      ? state.logs
          .map(
            (log) => `
              <article class="log-entry">
                <span class="log-entry-date">${escapeHtml(log.date.replace("天宝元年 · ", "元年·").replace("天宝二年 · ", "二年·"))}</span>
                <div>
                  <h3>${escapeHtml(log.title)}</h3>
                  <p>${escapeHtml(log.text)}</p>
                </div>
              </article>
            `,
          )
          .join("")
      : '<p class="log-empty">尚无案牍可查。</p>';
    els.logModal.classList.remove("hidden");
    document.body.classList.add("modal-open");
    els.logCloseButton.focus();
  }

  function openAbout() {
    closeAllModals();
    els.aboutModal.classList.remove("hidden");
    document.body.classList.add("modal-open");
    els.aboutCloseButton.focus();
  }

  function closeAllModals() {
    ["eventModal", "archiveModal", "helpModal", "logModal", "aboutModal"].forEach((key) => {
      els[key]?.classList.add("hidden");
    });
    document.body.classList.remove("modal-open");
  }

  function closeSimpleModal(key) {
    els[key]?.classList.add("hidden");
    const stillOpen = ["eventModal", "archiveModal", "helpModal", "logModal", "aboutModal"].some(
      (id) => !els[id]?.classList.contains("hidden"),
    );
    if (!stillOpen) document.body.classList.remove("modal-open");
  }

  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    while (els.toastStack.children.length >= 3) {
      els.toastStack.firstElementChild?.remove();
    }
    els.toastStack.appendChild(toast);
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.add("out");
      window.setTimeout(() => toast.remove(), 260);
    }, 3000);
  }

  function showFloatingAt(x, y, text, negative = false) {
    if (!text) return;
    const bubble = document.createElement("div");
    bubble.className = `floating-effect${negative ? " negative" : ""}`;
    bubble.textContent = text;
    bubble.style.left = `${clamp(x, 80, window.innerWidth - 80)}px`;
    bubble.style.top = `${clamp(y, 60, window.innerHeight - 60)}px`;
    bubble.style.transform = "translate(-50%, 0)";
    document.body.appendChild(bubble);
    window.setTimeout(() => bubble.remove(), 1150);
  }

  function toggleSound() {
    soundEnabled = !soundEnabled;
    savePreference(SOUND_KEY, soundEnabled);
    renderSoundButton();
    if (soundEnabled) playSound("map");
  }

  function renderSoundButton() {
    const on = els.soundButton.querySelector(".sound-on");
    const off = els.soundButton.querySelector(".sound-off");
    on.classList.toggle("hidden", !soundEnabled);
    off.classList.toggle("hidden", soundEnabled);
    els.soundButton.setAttribute("aria-label", soundEnabled ? "关闭音效" : "开启音效");
  }

  function playSound(kind) {
    if (!soundEnabled) return;
    try {
      if (!audioContext) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        audioContext = new AudioCtx();
      }
      if (audioContext.state === "suspended") audioContext.resume();
      const patterns = {
        start: [
          [196, 0, 0.32, 0.022],
          [261.63, 0.13, 0.42, 0.018],
          [329.63, 0.27, 0.52, 0.016],
        ],
        policy: [
          [392, 0, 0.15, 0.014],
          [523.25, 0.08, 0.25, 0.011],
        ],
        decision: [
          [261.63, 0, 0.18, 0.017],
          [329.63, 0.1, 0.25, 0.014],
          [392, 0.2, 0.35, 0.012],
        ],
        map: [[440, 0, 0.15, 0.009]],
        archive: [
          [523.25, 0, 0.18, 0.01],
          [659.25, 0.09, 0.3, 0.008],
        ],
        season: [
          [220, 0, 0.25, 0.013],
          [293.66, 0.12, 0.3, 0.012],
          [369.99, 0.24, 0.42, 0.01],
        ],
        victory: [
          [196, 0, 0.3, 0.014],
          [293.66, 0.16, 0.34, 0.013],
          [392, 0.32, 0.45, 0.012],
          [523.25, 0.52, 0.7, 0.01],
        ],
        failure: [
          [220, 0, 0.4, 0.015],
          [185, 0.18, 0.46, 0.014],
          [146.83, 0.38, 0.7, 0.012],
        ],
        error: [[146.83, 0, 0.15, 0.01]],
      };
      (patterns[kind] || patterns.map).forEach(([frequency, delay, duration, volume]) => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        oscillator.type = kind === "victory" ? "triangle" : "sine";
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + delay);
        gain.gain.setValueAtTime(0.0001, audioContext.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(volume, audioContext.currentTime + delay + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + delay + duration);
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start(audioContext.currentTime + delay);
        oscillator.stop(audioContext.currentTime + delay + duration + 0.03);
      });
    } catch {
      // Sound is decorative; gameplay should continue if audio is unavailable.
    }
  }

  function bindEvents() {
    els.startButton.addEventListener("click", startNewGame);
    els.continueButton.addEventListener("click", continueSavedGame);
    els.homeButton.addEventListener("click", showTitle);
    els.helpButton.addEventListener("click", openHelp);
    els.soundButton.addEventListener("click", toggleSound);
    els.archiveButton.addEventListener("click", openArchive);
    els.endTurnButton.addEventListener("click", openCurrentEvent);
    els.mapInfoClose.addEventListener("click", () => els.mapInfo.classList.add("hidden"));
    els.mapHintButton.addEventListener("click", () => {
      showToast("点选城坊中的市、驿、学、渠、烽，可收录一则地志。");
      document.querySelector(".map-spot")?.focus();
    });
    document.querySelectorAll(".map-spot").forEach((button) => {
      button.addEventListener("click", () => openMapPlace(button.dataset.place));
    });
    els.viewLogButton.addEventListener("click", openLog);
    els.archiveCloseButton.addEventListener("click", () => closeSimpleModal("archiveModal"));
    els.helpCloseButton.addEventListener("click", () => closeSimpleModal("helpModal"));
    els.helpStartButton.addEventListener("click", () => closeSimpleModal("helpModal"));
    els.logCloseButton.addEventListener("click", () => closeSimpleModal("logModal"));
    els.aboutCloseButton.addEventListener("click", () => closeSimpleModal("aboutModal"));
    els.aboutConfirmButton.addEventListener("click", () => closeSimpleModal("aboutModal"));
    els.titleAboutButton.addEventListener("click", openAbout);
    els.replayButton.addEventListener("click", () => {
      state = freshState();
      hideAllScreens();
      els.gameScreen.classList.remove("hidden");
      renderAll();
      saveState();
      showToast("新一任伊始。每局时局次序会有所不同。");
      playSound("start");
    });
    els.resultArchiveButton.addEventListener("click", openArchive);
    els.resultHomeButton.addEventListener("click", showTitle);
    els.eventCloseButton.addEventListener("click", () => closeSimpleModal("eventModal"));
    document.querySelectorAll(".archive-tab").forEach((tab) => {
      tab.addEventListener("click", () => renderArchive(tab.dataset.archiveTab));
    });
    document.querySelectorAll("[data-close]").forEach((element) => {
      element.addEventListener("click", () => {
        const keys = {
          archive: "archiveModal",
          help: "helpModal",
          log: "logModal",
          about: "aboutModal",
        };
        const key = keys[element.dataset.close];
        if (key) closeSimpleModal(key);
      });
    });
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (!els.archiveModal.classList.contains("hidden")) closeSimpleModal("archiveModal");
      else if (!els.helpModal.classList.contains("hidden")) closeSimpleModal("helpModal");
      else if (!els.logModal.classList.contains("hidden")) closeSimpleModal("logModal");
      else if (!els.aboutModal.classList.contains("hidden")) closeSimpleModal("aboutModal");
    });
  }

  function init() {
    cacheElements();
    bindEvents();
    renderSoundButton();
    refreshContinueButton();
  }

  init();
})();

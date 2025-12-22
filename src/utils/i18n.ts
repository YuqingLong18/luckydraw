export type Language = 'zh' | 'en';

type TranslationKey =
  | 'title'
  | 'runDraw'
  | 'drawing'
  | 'empty'
  | 'reset'
  | 'importNames'
  | 'importTitle'
  | 'importHint'
  | 'cancel'
  | 'import'
  | 'winners'
  | 'close'
  | 'show'
  | 'remaining'
  | 'noWinners'
  | 'winner'
  | 'round';

const translations: Record<Language, Record<TranslationKey, string>> = {
  zh: {
    title: '圣诞树幸运星',
    runDraw: '开始抽奖',
    drawing: '抽奖中...',
    empty: '名单为空',
    reset: '重置',
    importNames: '导入名单',
    importTitle: '导入名单',
    importHint: '在下方粘贴名单，每行一个名字。',
    cancel: '取消',
    import: '导入',
    winners: '中奖者',
    close: '收起',
    show: '展开',
    remaining: '剩余',
    noWinners: '暂无中奖者',
    winner: '中奖者',
    round: '第 {round} 轮',
  },
  en: {
    title: 'Lucky Draw on a Christmas Tree',
    runDraw: 'RUN DRAW',
    drawing: 'Drawing...',
    empty: 'Empty',
    reset: 'Reset',
    importNames: 'Import Names',
    importTitle: 'Import Names',
    importHint: 'Paste names below, one per line.',
    cancel: 'Cancel',
    import: 'Import',
    winners: 'Winners',
    close: 'Close',
    show: 'Show',
    remaining: 'Remaining',
    noWinners: 'No winners yet',
    winner: 'Winner',
    round: 'Round {round}',
  },
};

export const t = (lang: Language, key: TranslationKey, vars?: Record<string, string | number>) => {
  const template = translations[lang][key] ?? translations.en[key];
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? ''));
};

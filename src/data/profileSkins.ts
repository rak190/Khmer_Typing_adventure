export type ProfileSkinConfig = {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  shadowColor: string;
  gradient: string;
};

export const PROFILE_SKINS: ProfileSkinConfig[] = [
  {
    id: 'dawn',
    name: 'Dawn',
    primaryColor: '#F8D9B4',
    secondaryColor: '#E5AA74',
    accentColor: '#7B4A2A',
    shadowColor: '#9A6339',
    gradient: 'linear-gradient(135deg, #F8E0C0 0%, #E8C49A 52%, #C8986A 100%)',
  },
  {
    id: 'dusk',
    name: 'Dusk',
    primaryColor: '#C88E5B',
    secondaryColor: '#9F6337',
    accentColor: '#FFE0A8',
    shadowColor: '#6D3F26',
    gradient: 'linear-gradient(135deg, #D4A878 0%, #B8865A 52%, #8A5C34 100%)',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    primaryColor: '#596783',
    secondaryColor: '#293247',
    accentColor: '#D5E6FF',
    shadowColor: '#141A27',
    gradient: 'linear-gradient(135deg, #7282A8 0%, #44506F 52%, #20273A 100%)',
  },
  {
    id: 'jade',
    name: 'Jade',
    primaryColor: '#7DD8AF',
    secondaryColor: '#2B9D78',
    accentColor: '#F2FFE5',
    shadowColor: '#14634E',
    gradient: 'linear-gradient(135deg, #B9F6D0 0%, #58C990 52%, #1C7A5B 100%)',
  },
  {
    id: 'sapphire',
    name: 'Sapphire',
    primaryColor: '#75C9FF',
    secondaryColor: '#247AD6',
    accentColor: '#E8F7FF',
    shadowColor: '#174E8B',
    gradient: 'linear-gradient(135deg, #BCEBFF 0%, #58A6FF 52%, #2456B8 100%)',
  },
  {
    id: 'obsidian',
    name: 'Obsidian',
    primaryColor: '#575B65',
    secondaryColor: '#171B22',
    accentColor: '#F3C86A',
    shadowColor: '#05070B',
    gradient: 'linear-gradient(135deg, #747985 0%, #353A44 52%, #090B10 100%)',
  },
];

export const DEFAULT_SKIN_ID = 'dawn';

export function getProfileSkin(skinStyleId?: string) {
  return PROFILE_SKINS.find((skin) => skin.id === skinStyleId) ?? PROFILE_SKINS[0];
}

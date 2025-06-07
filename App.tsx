import React, { useState, useCallback, useMemo, useEffect } from 'react';
import WordListItem from './components/WordListItem';
import ExplanationModal from './components/ExplanationModal';
import { WordPair, Suffix, SearchMode } from './types';

const KERIA_EXPLANATION = `Atzizki honek «nolakotasuna» adierazten du, baina beti gaitzespen-kutsu batekin.
Alde horretatik, -tasun atzizkiaren aurkaria litzateke.

Adibideak:
* erosotasun (comodidad) / *erosokeria* (dejadez)
* harrotasuna (orgullo) / *harrokeria* (fanfarronería)
* itsutasuna (ceguera) / *itsukeria* (obcecación)
* zikinkeria (suciedad, porquería)
* alferkeria (pereza, holgazanería)`;

interface SuffixDetail {
  value: Suffix;
  name: string;
  explanation: string;
}

const SUFFIX_DETAILS_LIST: SuffixDetail[] = [
  { value: 'kor', name: '-kor', explanation: 'Joera edo zaletasuna adierazten du. Nolakotasuna adierazten duten izenondoak sortzeko erabiltzen da.\n\nAdibideak:\n* beldur*kor* (beldurtia)\n* gizalege*kor* (gizalegezkoa)\n* lagun*kor* (lagunkoia)\n* umore*kor* (umoretsua)' },
  { value: 'pen', name: '-pen', explanation: 'Ekintza edo sentimendu baten ondorioa edo emaitza adierazten du. Aditzoinari gehitzen zaio izen abstraktuak sortzeko.\n\nAdibideak:\n* itxaro*pen* (itxarotearen ondorioa)\n* ikus*pen* (ikustearen ondorioa)\n* senti*pen* (sentitzearen ondorioa)\n* oroi*pen* (oroitzearen ondorioa)\n* gara*pen* (garatzearen ondorioa)' },
  { value: 'garri', name: '-garri', explanation: 'Zerbait eragiten edo sortzen duena, edo zerbaitetarako egokia dena adierazten du.\n\nAdibideak:\n* erabil*garri* (erabil daitekeena)\n* ikus*garri* (ikus daitekeena, ikustekoa)\n* ezin sinetsiz*garri* (sinestezina)\n* onar*garri* (onartzeko modukoa)' },
  { value: 'keta', name: '-keta', explanation: 'Ekintza edo prozesu bat adierazten du, askotan modu intentsiboan edo errepikakorrean.\n\nAdibideak:\n* berri*keta* (berriketan aritzea)\n* azter*keta* (aztertzea)\n* hausnar*keta* (hausnartzea)\n* lehia*keta* (lehian aritzea)' },
  { value: 'ezin', name: '-ezin', explanation: 'Ezintasuna edo zerbait egiteko ezintasuna adierazten du. Askotan aditz-izenarekin batera erabiltzen da.\n\nAdibideak:\n* *ezin* etorri (etortzeko ezintasuna)\n* *ezin* egin (egiteko ezintasuna)\n* *ezin* sinetsi (sinesteko ezintasuna)\n* *ezin* ikusi (ikusteko ezintasuna)' },
  { value: 'keria', name: '-keria', explanation: KERIA_EXPLANATION },
  { value: 'men', name: '-men', explanation: 'Ekintza baten ondorioa, emaitza edo horrekin lotutako kontzeptu abstraktua adierazten du.\n\nAdibideak:\n* agindu*men* (agintzeko ahalmena)\n* ezagu*men* (ezagutzeko gaitasuna)\n* uler*men* (ulertzeko gaitasuna)\n* eska*men* (eskatzea)' },
  { value: 'aldi', name: '-aldi', explanation: 'Denbora-tartea edo gertaera bat adierazten du.\n\nAdibideak:\n* denbor*aldi* (denbora tartea)\n* gazt*aldi* (gaztaroa)\n* ekaitz*aldi* (ekaitz garaia)\n* goiz*aldi* (goizeko tartea)' },
  { value: 'tegi', name: '-tegi', explanation: 'Lekua edo zerbait gordetzeko tokia adierazten du.\n\nAdibideak:\n* liburu*tegi* (liburuak gordetzeko tokia)\n* lan*tegi* (lan egiteko tokia)\n* abel*tegi* (abelgorriak gordetzeko tokia)\n* har*tegi* (harria ateratzeko tokia)' },
  { value: 'buru', name: '-buru', explanation: 'Joera, zaletasuna edo kualitate bat adierazten du, askotan pertsona bati lotuta.\n\nAdibideak:\n* lotsa*buru* (lotsatia)\n* harro*buru* (harroa)\n* lan*buru* (langilea)\n* buruargi (listo)' },
  { value: 'erraz', name: '-erraz', explanation: 'Modua edo erraztasuna adierazten du. \'Erraz\' hitzarekin lotuta dago.\n\nAdibideak:\n* uler*erraz* (ulertzeko erraza)\n* eusk*erraz* (euskaraz erraz egiten duena)\n* jan*erraz* (jateko erraza)' },
  { value: 'kuntza', name: '-kuntza', explanation: 'Ekintza, prozesua edo jarduera baten emaitza edo multzoa adierazten du. Izen abstraktuak sortzen ditu.\n\nAdibideak:\n* hez*kuntza* (heztearen ekintza)\n* sor*kuntza* (sortzearen ekintza)\n* iker*kuntza* (ikertzearen ekintza)' },
  { value: 'kizun', name: '-kizun', explanation: 'Egin behar den zerbait edo etorkizuneko ekintza bat adierazten du.\n\nAdibideak:\n* egin*kizun* (egitekoa)\n* ikus*kizun* (ikuskizuna)\n* galde*kizun* (galdera)' },
  { value: 'kide', name: '-kide', explanation: 'Parte-hartzea, kidetasuna edo talde berekoa izatea adierazten du.\n\nAdibideak:\n* lan*kide* (laneko laguna)\n* bidai*kide* (bidaia laguna)\n* ikas*kide* (ikasketetako laguna)' },
  { value: 'bera', name: '-bera', explanation: 'Joera edo sentikortasuna adierazten du. \'Bera\' hitzak \'sentibera\' esan nahi du batzuetan.\n\nAdibideak:\n* lotsa*bera* (lotsatia)\n* min*bera* (erraz min hartzen duena)\n* maite*bera* (erraz maitemintzen dena)' },
  { value: 'aro', name: '-aro', explanation: 'Denbora-tarte, garai edo aro bat adierazten du.\n\nAdibideak:\n* haurtz*aro* (haurra izateko garaia)\n* gazt*aro* (gaztea izateko garaia)\n* ud*aro* (uda garaia)' },
  { value: 'kada', name: '-kada', explanation: 'Kolpea, ekintza edo kopuru bat adieraz dezake.\n\nAdibideak:\n* osti*kada* (ostiko baten kolpea)\n* besark*ada* (besarkada)\n* mil*aka* (milako kopurua)' },
  { value: 'mendu', name: '-mendu', explanation: 'Ekintza baten emaitza, egoera edo prozesua adierazten du. Izen abstraktuak sortzeko erabiltzen da.\n\nAdibideak:\n* gara*mendu* (garatzea)\n* alda*mendu* (aldatzea)\n* senti*mendu* (sentitzea)' },
  { value: 'gune', name: '-gune', explanation: 'Lekua, tokia edo eremu bat adierazten du.\n\nAdibideak:\n* lan*gune* (lan egiteko tokia)\n* atseden*gune* (atseden hartzeko tokia)\n* bil*gune* (biltzeko tokia)' },
  { value: 'tasun', name: '-tasun', explanation: 'Nolakotasuna, egoera edo kualitatea adierazten du. Izen abstraktuak sortzen ditu.\n\nAdibideak:\n* eder*tasun* (ederra izatea)\n* zorion*tasun* (zoriontsu izatea)\n* anai*tasun* (anaiarteko harremana)' },
];

const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('general');
  const [selectedSuffix, setSelectedSuffix] = useState<Suffix>(null);
  const [filteredWords, setFilteredWords] = useState<WordPair[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', explanation: '' });

  const [fetchedWordData, setFetchedWordData] = useState<WordPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [wordsResponse, verbsResponse] = await Promise.all([
          fetch('/data.json'),
          fetch('/verbData.json')
        ]);

        if (!wordsResponse.ok || !verbsResponse.ok) {
          const wordsError = !wordsResponse.ok ? `data.json: ${wordsResponse.statusText}` : '';
          const verbsError = !verbsResponse.ok ? `verbData.json: ${verbsResponse.statusText}` : '';
          throw new Error(`Datuak kargatzean errorea: ${wordsError} ${verbsError}`.trim());
        }

        const wordsJson: WordPair[] = await wordsResponse.json();
        const verbsJson: WordPair[] = await verbsResponse.json();
        
        const combinedData = [...wordsJson, ...verbsJson]
          .filter((word, index, self) =>
            index === self.findIndex((w) => w.id === word.id || (w.basque === word.basque && w.spanish === word.spanish))
          )
          .sort((a, b) => a.basque.localeCompare(b.basque));
        
        setFetchedWordData(combinedData);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Errorea gertatu da datuak kargatzean.');
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);


  useEffect(() => {
    if (loading || error || fetchedWordData.length === 0) {
      setFilteredWords([]);
      return;
    }

    if (!searchTerm && searchMode === 'general' && !selectedSuffix) {
      setFilteredWords([]); 
      return;
    }

    let results = fetchedWordData;

    if (searchMode === 'suffix' && selectedSuffix) {
      results = results.filter(wordPair => {
        const basqueWordPart = wordPair.basque.split(',')[0].trim();
        if (basqueWordPart.length >= selectedSuffix.length && !basqueWordPart.startsWith('-')) {
          return basqueWordPart.toLowerCase().endsWith(selectedSuffix.toLowerCase());
        }
        return false;
      });
    }

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      results = results.filter(word => {
        const matchesBasque = word.basque.toLowerCase().startsWith(lowerSearchTerm) ||
                              (word.synonyms_basque && word.synonyms_basque.toLowerCase().startsWith(lowerSearchTerm));
        
        const spanishTextWords = (word.spanish || "").toLowerCase().split(/[^a-zA-Z0-9ñÑáéíóúüÁÉÍÓÚÜ]+/).filter(w => w.length > 0);
        const synonymSpanishTextWords = (word.synonyms_spanish || "").toLowerCase().split(/[^a-zA-Z0-9ñÑáéíóúüÁÉÍÓÚÜ]+/).filter(w => w.length > 0);
        
        const matchesSpanish = spanishTextWords.includes(lowerSearchTerm) ||
                               (word.synonyms_spanish && synonymSpanishTextWords.includes(lowerSearchTerm));
                               
        return matchesBasque || matchesSpanish;
      });
    }
    
    setFilteredWords(results);
  }, [searchTerm, searchMode, selectedSuffix, fetchedWordData, loading, error]);
  
  const handleShowExplanation = (suffix: Suffix) => {
    const detail = SUFFIX_DETAILS_LIST.find(d => d.value === suffix);
    if (detail) {
      setModalContent({ title: detail.name, explanation: detail.explanation });
      setIsModalOpen(true);
    }
  };

  const handleSuffixSelection = (suffix: Suffix) => {
    setSelectedSuffix(suffix);
    if (suffix) {
      setSearchMode('suffix'); 
    } else if (searchMode === 'suffix' && !suffix) {
       setSearchMode('general'); 
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-slate-100 p-4">
        <div role="status" aria-label="Kargatzen">
          <svg aria-hidden="true" className="w-12 h-12 text-slate-600 animate-spin fill-teal-400" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
          </svg>
          <span className="sr-only">Kargatzen...</span>
        </div>
        <p className="text-2xl mt-4">Datuak kargatzen...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-400 p-4 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-2xl">Errorea datuak kargatzean</p>
        <p className="text-slate-300 mt-2">{error}</p>
        <p className="text-slate-300 mt-2">Mesedez, saiatu berriro geroago edo egiaztatu zure konexioa.</p>
      </div>
    );
  }
  

  return (
    <div className="min-h-screen text-slate-100 flex flex-col items-center p-4">
      <header className="w-full max-w-3xl mx-auto my-8 text-center">
        <h1 className="text-5xl font-bold text-teal-400 mb-4">Hiztegia</h1>
        <p className="text-xl text-teal-300">Euskara - Gaztelania</p>
      </header>

      <div className="w-full max-w-xl mx-auto mb-8 p-6 bg-slate-800 rounded-xl shadow-2xl">
        <input
          type="search"
          placeholder="Bilatu hitzak..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-4 bg-slate-700 text-slate-100 border border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
          aria-label="Bilaketa-barra"
        />
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <label htmlFor="searchModeSelect" className="text-slate-300">Bilaketa modua:</label>
            <select 
              id="searchModeSelect"
              value={searchMode}
              onChange={(e) => {
                const newMode = e.target.value as SearchMode;
                setSearchMode(newMode);
                if (newMode === 'general') {
                  setSelectedSuffix(null); 
                } else if (newMode === 'suffix' && !selectedSuffix) {
                  setSelectedSuffix(SUFFIX_DETAILS_LIST[0]?.value || null); 
                }
              }}
              className="p-2 bg-slate-700 text-slate-100 border border-slate-600 rounded-md focus:ring-1 focus:ring-teal-500"
              aria-label="Bilaketa modua hautatu"
            >
              <option value="general">Orokorra</option>
              <option value="suffix">Atzizkika</option>
            </select>
          </div>

          {searchMode === 'suffix' && (
            <div className="flex items-center space-x-2">
               <label htmlFor="suffixSelect" className="sr-only">Aukeratu atzizkia</label>
              <select
                id="suffixSelect"
                value={selectedSuffix || ''}
                onChange={(e) => handleSuffixSelection(e.target.value as Suffix)}
                className="p-2 bg-slate-700 text-slate-100 border border-slate-600 rounded-md focus:ring-1 focus:ring-teal-500"
                aria-label="Atzizkia hautatu"
              >
                <option value="">-- Hautatu Atzizkia --</option>
                {SUFFIX_DETAILS_LIST.map(detail => (
                  <option key={detail.value} value={detail.value || ''}>{detail.name}</option>
                ))}
              </select>
              {selectedSuffix && SUFFIX_DETAILS_LIST.find(s => s.value === selectedSuffix)?.explanation && (
                <button
                  onClick={() => handleShowExplanation(selectedSuffix)}
                  className="p-2 bg-orange-500 hover:bg-orange-600 rounded-md text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  aria-label={`${selectedSuffix} atzizkiaren azalpena erakutsi`}
                >
                  Azalpena
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <main className="w-full max-w-3xl mx-auto flex-grow">
        {filteredWords.length > 0 ? (
          <div className="space-y-4">
            {filteredWords.map(wordPair => (
              <WordListItem key={wordPair.id} wordPair={wordPair} searchTerm={searchTerm} />
            ))}
          </div>
        ) : (
          (searchTerm || (searchMode === 'suffix' && selectedSuffix)) && (
            <p className="text-center text-slate-400 text-lg mt-8">Ez da emaitzarik aurkitu.</p>
          )
        )}
         {!searchTerm && searchMode === 'general' && !selectedSuffix && fetchedWordData.length > 0 && (
          <p className="text-center text-slate-400 text-lg mt-8">
            Idatzi bilaketa-koadroan hitz bat aurkitzeko edo hautatu atzizki bat.
          </p>
        )}
      </main>

      <footer className="text-center py-6 mt-12 w-full">
        <p className="text-sm text-slate-400">
          © {new Date().getFullYear()} Hiztegia Euskara-Gaztelania. Eskubide guztiak erreserbatuta.
        </p>
      </footer>

      <ExplanationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalContent.title}
        explanation={modalContent.explanation}
      />
    </div>
  );
};

export default App;
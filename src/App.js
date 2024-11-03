import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ArticleCard from './ArticleCard';
import { Icon } from '@iconify/react';
import { XMLParser } from 'fast-xml-parser';
import { motion, AnimatePresence } from 'framer-motion';
import SpeakingOverlay from './SpeakingOverlay';
import SearchBar from './SearchBar';
import Welcome from './Welcome';

const AppContainer = styled.div`
  text-align: left;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(
    120deg,
    #fafafa 0%,
    #f8f9ff 50%,
    #fafafa 100%
  );
  position: relative;
  overflow: hidden;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.85rem 2rem 6rem 2rem;
  
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
  text-align: left;
`;

const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  color: #666;
  font-family: 'Inter', sans-serif;
  margin-top: 100px;
  
  .spin {
    font-size: 2rem;
    margin-bottom: 1rem;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  padding: 1rem;
  background: #fdf0ed;
  border-radius: 8px;
  margin: 1rem;
  font-family: 'Inter', sans-serif;
`;

const AnswerSection = styled.div`
  text-align: left;
  padding: 2rem;
  margin-bottom: 0em;
  
  h1 {
    font-family: 'Fraunces', serif;
    font-size: 2rem;
    margin-bottom: 1.75rem;
  }
  
  p {
    font-family: 'Inter', sans-serif;
    font-size: 1rem;
    color: #666;
    line-height: 1.6;
  }
`;

const CircleButton = styled.button`
  position: absolute;
  top: 2rem;
  right: 2rem;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: url(${props => props.image}) no-repeat center center;
  background-size: cover;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  }

  &:hover .tooltip {
    opacity: 1;
    transform: translateY(0);
  }
`;

const NewSessionButton = styled(CircleButton)`
  right: 5.5rem;
  background: #fcfafa;
  border: 1px solid #e0e0e0;
  
  &:hover {
    background: #f0f0f0;
    transform: scale(1.05) rotate(0deg);
  }
`;

const LoadingAnswer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: #666;
  font-family: 'Inter', sans-serif;
  
  .spin {
    font-size: 1.2rem;
    animation: spin 1s linear infinite;
  }
`;

const SkeletonText = styled.div`
  width: 100%;
  height: 20px;
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  margin: 8px 0;

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

const SkeletonAnswer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: -0.25rem;
`;

const ConsensusScore = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.1rem;
  background: ${props => {
    if (props.score >= 80) return 'linear-gradient(135deg, #13ad5e 100%, #13ad5e 100%)';
    if (props.score >= 60) return 'linear-gradient(135deg, #f0ad4e 100%, #f0ad4e 100%)';
    return 'linear-gradient(135deg, #d9534f 100%, #d9534f 100%)';
  }};
  border-radius: 8px;
  color: white;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 400;
  box-shadow: 0 2px 10px rgba(16, 185, 129, 0.0);
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const SmallHeadingContainer = styled.div`
  display: flex;
  gap: 0.55em;
  margin-top: 0rem;
  flex-wrap: wrap;
  margin-left: 2rem;
  
  &:before {
    content: '${props => props.content}';
    display: block;
    width: 100%;
    font-family: 'Fraunces', serif;
    font-size: 1.15rem;
    margin-bottom: 0.8rem;
    color: #333;
  }
`;


const KeyPointsContainer = styled.div`
  display: flex;
  gap: 0.55rem;
  margin-top: 2.5rem;
  flex-wrap: wrap;
  
  &:before {
    content: 'Key Facts & Figures';
    display: block;
    width: 100%;
    font-family: 'Fraunces', serif;
    font-size: 1.15rem;
    margin-bottom: 0.8rem;
    color: #333;
  }
`;

const KeyPoint = styled(motion.div)`
  padding: 0.55rem 0.9rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  color: #333;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  white-space: nowrap;
`;

const ScoreContainer = styled.div`
  display: flex;
  gap: 0.8rem;
  align-items: center;
`;

const ArticleCount = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.1rem;
  background: transparent;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  color: #666;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 400;
  white-space: nowrap;
`;

const CitationList = styled.div`
  display: flex;
  gap: 0.4rem;
  margin-right: 0.5rem;
  font-family: 'Inter', sans-serif;
`;

const CitationDot = styled.div`
  width: 23px;
  height: 23px;
  border-radius: 50%;
  background: transparent;
  border: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  color: #666;
  cursor: pointer;
  position: relative;
  font-family: 'Inter', sans-serif;
  
  &:hover .tooltip {
    opacity: 1;
    transform: translateY(0);
  }
`;

const CitationTooltip = styled.div`
  position: absolute;
  bottom: 130%;
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  padding: 0.8rem 1rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  color: #333;
  white-space: nowrap;
  opacity: 0;
  transition: all 0.2s ease;
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  z-index: 100;
  font-family: 'Inter', sans-serif;
  min-width: 200px;

  .title {
    font-weight: 500;
    margin-bottom: 4px;
  }

  .meta {
    font-size: 0.75rem;
    color: #666;
  }
`;

const InlineCitation = styled.sup`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #f5f5f5;
  font-size: 0.5rem;
  color: #666;
  margin-left: 2px;
  margin-right: 1px;
  cursor: pointer;
  border: 1px solid #e0e0e0;
  position: relative;
  top: -2px;
  
  &:hover .tooltip {
    opacity: 1;
    transform: translateY(0);
  }
`;

const FloatingParticle = styled(motion.div)`
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(100, 100, 100, 0.1);
  border-radius: 50%;
  pointer-events: none;
`;

const ButtonTooltip = styled.div`
  position: absolute;
  bottom: -40px;

  transform: translateX(-50%) translateY(10px);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  transition: all 0.2s ease;
  pointer-events: none;
  font-family: 'Inter', sans-serif;

  &:before {
    content: '';
    position: absolute;
    top: -4px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: 5px solid rgba(0, 0, 0, 0.8);
  }
`;

const DirectAnswerSection = styled(motion.div)`
  background: linear-gradient(to right, #f8f9ff, #ffffff);
  padding: 1.2rem 1.25rem;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  margin-bottom: 1.3rem;
  
  p {
    font-family: 'Inter', sans-serif;
    letter-spacing: -0.15px;
    font-size: 1rem;
    color: #333;
    font-weight: 400;
    margin: 0;
    line-height: 1.7;
  }
`;

const RichTextAnswer = styled.div`
  p {
    margin-bottom: 1.5rem;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const RelatedQuestion = styled(motion.div)`
  padding: 0.55rem 0.9rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  color: #333;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  white-space: normal;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f8f9ff;
    transform: translateY(-1px);
  }
`;

function App() {
  const [query, setQuery] = useState('');
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [answer, setAnswer] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasExistingResults, setHasExistingResults] = useState(false);
  const [consensusScore, setConsensusScore] = useState(0);
  const [keyPoints, setKeyPoints] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [topCitations, setTopCitations] = useState([]);
  const [floatingParticles, setFloatingParticles] = useState([]);
  const [directAnswer, setDirectAnswer] = useState('');
  const [relatedQuestions, setRelatedQuestions] = useState([]);

  const exampleQueries1 = [
      "🧬 Is aspartame bad for me?",
      "🌊 Are Europa's oceans habitable?",
      "✨ Do solar flares affect human behavior?",
      "🕳️ Can information escape black holes?",
      "🧠 Can AI become conscious?",
      "🦕 Were dinosaurs warm-blooded?",
      "🦠 Can viruses be beneficial?",
      "🌡️ Is global warming reversible?",
      "🧩 Is quantum teleportation possible?"
  ];
  
  const exampleQueries2 = [
      "💻 Can quantum computers break encryption?",
      "⚡ Is fusion energy commercially viable?",
      "🌌 Does dark matter interact with itself?",
      "🌍 Is the universe infinite?",
      "🧪 Are vaccine side effects underreported?",
      "🔬 Should CRISPR be used on humans?",
      "🧮 Is P equal to NP?",
      "🧫 Can stem cells cure aging?",
      "🛸 Is alien life microbial?"
  ];

  const parseXMLResponse = (xmlData) => {
    const parser = new XMLParser();
    const result = parser.parse(xmlData);
    
    if (!result.feed || !result.feed.entry) {
      return [];
    }

    const entries = Array.isArray(result.feed.entry) 
      ? result.feed.entry 
      : [result.feed.entry];

    return entries.map(entry => ({
      title: entry.title,
      authors: Array.isArray(entry.author) 
        ? entry.author.map(a => a.name).join(', ')
        : entry.author.name,
      summary: entry.summary,
      link: entry.id,
      published: new Date(entry.published).toLocaleDateString(),
      doi: entry.doi || 'No DOI available'
    }));
  };

  const calculateConsensusScore = async (text) => {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo-1106",
          response_format: { type: "json_object" },
          messages: [
            { 
              role: "system", 
              content: "Analyze the given text and return a JSON object with a consensus score between 0-100. Consider factors like certainty of statements, scientific backing, and clarity of conclusions." 
            },
            { 
              role: "user", 
              content: `Analyze this text and provide a consensus score: ${text}` 
            }
          ]
        }),
      });

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);
      setConsensusScore(result.consensusScore);
    } catch (error) {
      console.error('Error calculating consensus score:', error);
      setConsensusScore(0);
    }
  };

  const generateKeyPoints = async (text) => {
    const summaries = articles.map((a, i) => `[${i + 1}] ${a.summary}`).join('\n\n');
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo-1106",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: "Extract 5-6 key facts and figures in shorthand style (6-10 words each). Return as JSON with 'keyPoints' array containing objects with 'emoji' and 'point' properties. Make points very concise."
            },
            {
              role: "user",
              content: `Extract facts and figures that are relevant to the user's prompt "${text}" points from: ${summaries}`
            }
          ]
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error('Failed to generate key points');
      
      const result = JSON.parse(data.choices[0].message.content);
      if (!result.keyPoints || !Array.isArray(result.keyPoints)) {
        throw new Error('Invalid key points format');
      }
      
      setKeyPoints(result.keyPoints);
    } catch (error) {
      console.error('Error generating key points:', error);
      // Set default key points if generation fails
      setKeyPoints([
        { emoji: "📝", point: "No key points could be generated" }
      ]);
    }
  };

  const generateDirectAnswer = async (text) => {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo-1106",
          messages: [
            {
              role: "system",
              content: "Provide a direct, simple 2 sentence consensus answer to the question based on the given text. Use clear, accessible language."
            },
            {
              role: "user",
              content: `Original question: ${query}\n\nText to summarize: ${text}`
            }
          ]
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error('Failed to generate direct answer');
      setDirectAnswer(data.choices[0].message.content);
    } catch (error) {
      console.error('Error generating direct answer:', error);
      setDirectAnswer('');
    }
  };

  const generateRelatedQuestions = async (text) => {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo-1106",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: "Generate 5 related questions that users might also ask about this topic. Return as JSON with 'questions' array containing objects with 'emoji' and 'question' properties. Make questions concise and engaging."
            },
            {
              role: "user",
              content: `Generate related questions for: ${query}\n\nBased on this content: ${text}`
            }
          ]
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error('Failed to generate related questions');
      
      const result = JSON.parse(data.choices[0].message.content);
      if (!result.questions || !Array.isArray(result.questions)) {
        throw new Error('Invalid questions format');
      }
      
      setRelatedQuestions(result.questions);
    } catch (error) {
      console.error('Error generating related questions:', error);
      setRelatedQuestions([]);
    }
  };

  const generateAnswer = async (articles) => {
    setIsGenerating(true);
    setIsReady(false);
    const summaries = articles.map((a, i) => `[${i + 1}] ${a.summary}`).join('\n\n');
    const prompt = `Based on these research paper abstracts, provide a comprehensive summary. Group related findings together and cite papers using numbers in square brackets [1-5]. Always include at least one citation for each statement. Use multiple citations when findings are supported by multiple papers. Format citations at the end of sentences, before the period, like this [1] or [1,2,3]. Each major claim must have a citation.\n\n${summaries}`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", 
          messages: [
            { 
              role: "system", 
              content: "You are a research assistant providing two-paragraph summaries. Group related findings and use multiple citations when appropriate. Format citations as [1], [1,2], etc." 
            },
            { role: "user", content: prompt }
          ]
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
      }
      const processAnswer = (answer) => {
        // Replace citation patterns with properly formatted ones
        return answer.replace(/\[(\d+(?:,\s*\d+)*)\]/g, (match, nums) => {
          const citations = nums.split(',').map(n => n.trim());
          return `<sup class="citation">[${citations.join(',')}]</sup>`;
        });
      };
      const formattedAnswer = processAnswer(data.choices[0].message.content)
        .split('\n\n')
        .map(p => `<p>${p}</p>`)
        .join('');
      setAnswer(formattedAnswer);
      
      // Store the first 5 articles for citations
      setTopCitations(articles.slice(0, 5).map(a => ({
        title: a.title,
        authors: a.authors,
        published: a.published
      })));
      
      await generateDirectAnswer(formattedAnswer);
      
      // Generate both consensus score and key points
      await Promise.all([
        calculateConsensusScore(formattedAnswer),
        generateKeyPoints(data.choices[0].message.content),
        generateRelatedQuestions(formattedAnswer)
      ]);
      
      setIsReady(true);
    } catch (error) {
      console.error('Error generating answer:', error);
      setAnswer('Failed to generate summary. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getResearchArticles = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);

    if (hasExistingResults) {
      // If we have existing articles, just generate a new answer
      generateAnswer(articles);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=8`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }

      const data = await response.text();
      const parsedArticles = parseXMLResponse(data);
      setArticles(parsedArticles);
      setHasExistingResults(true);
      generateAnswer(parsedArticles);
    } catch (err) {
      setError('Failed to fetch research articles. Please try again.');
      console.error('Error fetching articles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      getResearchArticles();
    }
  };

  const handleExampleClick = (queryText) => {
    // Remove the emoji and trim
    const cleanQuery = queryText.replace(/^[^\s]+\s/, '').trim();
    setQuery(cleanQuery);
    getResearchArticles();
  };

  const toggleSpeaking = () => setIsSpeaking(!isSpeaking);

  const resetSession = () => {
    setArticles([]);
    setAnswer('');
    setQuery('');
    setHasExistingResults(false);
  };

  const newtonImage = 'https://applescoop.org/image/wallpapers/iphone/13243688646369157-70753860237924132.jpg';

  useEffect(() => {
    const particles = [];
    const numParticles = 20;

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
      });
    }

    setFloatingParticles(particles);
  }, []);

  return (
    <AppContainer>
      {floatingParticles.map((particle) => (
        <FloatingParticle
          key={particle.id}
          initial={{ x: particle.x, y: particle.y }}
          animate={{
            x: [particle.x - 50, particle.x + 50, particle.x],
            y: [particle.y - 50, particle.y + 50, particle.y],
          }}
          transition={{
            duration: 20 + Math.random() * 10,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
      <AnimatePresence>
        {isSpeaking && (
          <SpeakingOverlay 
            onClose={() => setIsSpeaking(false)}
            image={newtonImage}
            previousContext={{
              answer,
              directAnswer,
              keyPoints,
              query
            }}
          />
        )}
      </AnimatePresence>
      
      <CircleButton onClick={toggleSpeaking} image={newtonImage}>
        <ButtonTooltip className="tooltip">Live Talk</ButtonTooltip>
      </CircleButton>
      <NewSessionButton onClick={resetSession}>
        <Icon icon="ph:plus-bold" style={{ fontSize: '20px', color: '#1a1a1a' }} />
        <ButtonTooltip className="tooltip">New Session</ButtonTooltip>
      </NewSessionButton>

      <Content>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {isLoading ? (
          <LoadingWrapper>
            <Icon icon="mdi:loading" className="spin" />
            <p>Searching for articles...</p>
          </LoadingWrapper>
        ) : articles.length > 0 ? (
          <>
            <AnswerSection>
              <HeaderRow>
                <h1>{query}</h1>
                {isReady && (
                  <ScoreContainer>
                    <CitationList>
                      {topCitations.map((cite, i) => (
                        <CitationDot key={i}>
                          {i + 1}
                          <CitationTooltip className="tooltip">
                            <div className="title">{cite.title}</div>
                            <div className="meta">{cite.authors} | {cite.published} </div>
                          </CitationTooltip>
                        </CitationDot>
                      ))}
                    </CitationList>
                    <ArticleCount>
                      <Icon icon="mdi:file-document-multiple-outline" style={{ fontSize: '16px' }} />
                      Searched 50 articles
                    </ArticleCount>
                    <ConsensusScore score={consensusScore}>
                      <Icon icon="mdi:chart-bar" style={{ fontSize: '16px' }} />
                      Consensus Score: {consensusScore}%
                    </ConsensusScore>
                  </ScoreContainer>
                )}
              </HeaderRow>
              {isGenerating ? (
                <SkeletonAnswer>
                  <SkeletonText style={{ width: '100%' }} />
                  <SkeletonText style={{ width: '92%' }} />
                  <SkeletonText style={{ width: '96%' }} />
                  <SkeletonText style={{ width: '88%' }} />
                </SkeletonAnswer>
              ) : (
                <>
                  {directAnswer && (
                    <DirectAnswerSection
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <p><strong>🔎 Quick Answer: </strong>{directAnswer}</p>
                    </DirectAnswerSection>
                  )}
                  <RichTextAnswer
                    dangerouslySetInnerHTML={{
                      __html: answer
                    }}
                  />
                  {isReady && keyPoints && keyPoints.length > 0 && (
                    <KeyPointsContainer>
                      {keyPoints.map((point, index) => (
                        <KeyPoint
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          {point.emoji} {point.point}
                        </KeyPoint>
                      ))}
                    </KeyPointsContainer>
                  )}
                </>
              )}
            </AnswerSection>

            <SmallHeadingContainer content="Highest-Authority Sources Newton Pulled From" />

            <Grid>
              {articles.map((article, index) => (
                <ArticleCard key={index} article={article} index={index} />
              ))}
            </Grid>

            {isReady && relatedQuestions && relatedQuestions.length > 0 && (
                    <SmallHeadingContainer content="People Also Ask" style={{marginTop: '1.5rem'}}>
                      {relatedQuestions.map((item, index) => (
                        <RelatedQuestion
                          key={index} 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          onClick={() => {
                            setQuery(item.question);
                            getResearchArticles();
                          }}
                        >
                          {item.emoji} {item.question}
                        </RelatedQuestion>
                      ))}
                    </SmallHeadingContainer>
                  )}
          </>
        ) : (
          <Welcome 
            exampleQueries1={exampleQueries1}
            exampleQueries2={exampleQueries2}
            handleExampleClick={handleExampleClick}
          />
        )}
      </Content>
      
      <SearchBar
        query={query}
        setQuery={setQuery}
        handleSearch={getResearchArticles}
        isLoading={isLoading}
      />
    </AppContainer>
  );
}

export default App;

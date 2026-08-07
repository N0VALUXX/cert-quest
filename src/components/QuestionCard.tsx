import type { Enrichment, Letter, Mastery, Question } from "../types";
import { MASTERY_LABEL } from "../lib/srs";
import { VisualBlock } from "./Visual";

function Banner({ mastery, right }: { mastery: Mastery; right: string }) {
  return (
    <div className={`banner tone-${mastery}`}>
      <span>{MASTERY_LABEL[mastery]}</span>
      <span className="banner-right">{right}</span>
    </div>
  );
}

export function Explanation({
  q,
  enrichment,
}: {
  q: Question;
  enrichment: Enrichment | undefined;
}) {
  if (!enrichment) {
    return (
      <div className="explain">
        <div className="no-explain">
          The answer is <b>{q.answer}</b>. A deep explanation for this question has not been written
          yet — it is queued for a later round.
        </div>
      </div>
    );
  }

  const wrongEntries = (Object.keys(enrichment.wrong) as Letter[])
    .filter((l) => enrichment.wrong[l])
    .sort();

  return (
    <div className="explain">
      <div className="panel good">
        <h4>Why {q.answer} is right</h4>
        <p>{enrichment.why}</p>
      </div>

      {wrongEntries.length > 0 && (
        <div className="panel bad">
          <h4>Why the others fail</h4>
          <div className="wrong-list">
            {wrongEntries.map((l) => (
              <div className="wrong-row" key={l}>
                <span className="key">{l}</span>
                <span>{enrichment.wrong[l]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {enrichment.visual && <VisualBlock visual={enrichment.visual} />}

      <div className="panel info">
        <h4>The underlying concept</h4>
        <p>{enrichment.concept}</p>
      </div>

      <div className="panel warn">
        <h4>Exam trap</h4>
        <p>{enrichment.trap}</p>
      </div>

      {enrichment.disputed && (
        <div className="disputed">
          <h4>Contested answer — many argue for {enrichment.disputed.claimed}</h4>
          <p>{enrichment.disputed.argument}</p>
        </div>
      )}

      {enrichment.refs.length > 0 && (
        <div className="panel">
          <h4>References</h4>
          <div className="refs">
            {enrichment.refs.map((r) => (
              <a key={r.url} href={r.url} target="_blank" rel="noreferrer noopener">
                {r.label} ↗
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function QuestionCard({
  q,
  enrichment,
  mastery,
  chosen,
  revealed,
  onChoose,
  bannerRight,
  showExplanation = true,
}: {
  q: Question;
  enrichment: Enrichment | undefined;
  mastery: Mastery;
  chosen: Letter | null;
  revealed: boolean;
  onChoose: (l: Letter) => void;
  bannerRight?: string;
  showExplanation?: boolean;
}) {
  return (
    <div className="card">
      <Banner mastery={mastery} right={bannerRight ?? `Q${q.num}`} />
      <div className="card-body">
        <span className="domain-tag">{q.domain}</span>
        <p className="stem">{q.stem}</p>

        <div className="options">
          {q.options.map((o) => {
            const isAnswer = o.l === q.answer;
            const isChosen = chosen === o.l;
            let cls = "opt";
            if (revealed) {
              if (isAnswer) cls += " correct";
              else if (isChosen) cls += " chosen-wrong";
              else cls += " muted";
            }
            return (
              <button
                key={o.l}
                className={cls}
                disabled={revealed}
                onClick={() => onChoose(o.l)}
              >
                <span className="key">{o.l}</span>
                <span>{o.t}</span>
                {revealed && isAnswer && <span className="verdict">Correct</span>}
                {revealed && isChosen && !isAnswer && <span className="verdict">Your pick</span>}
              </button>
            );
          })}
        </div>

        {revealed && showExplanation && <Explanation q={q} enrichment={enrichment} />}
      </div>
    </div>
  );
}

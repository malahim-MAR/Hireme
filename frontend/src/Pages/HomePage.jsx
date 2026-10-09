import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Code2, ShieldCheck } from 'lucide-react';
export default function HomePage() {
  return <main className="start-page"><section className="start-hero">
    <div className="start-copy"><span className="home-kicker"><i /> A little simpler. A better fit.</span><h1>Your next chapter<br />starts with <span>a connection.</span></h1><p>A focused space for developers and companies to find each other, start a conversation, and move forward.</p></div>
    <div className="role-choice-grid" aria-label="Choose account type">
      <Link to="/company-login" className="role-choice-card"><span className="role-icon"><Building2 size={21} strokeWidth={1.6} /></span><strong>Find your next teammate.</strong><p>Discover verified developers and keep every hiring conversation in one place.</p><span className="role-action">I'm hiring <ArrowRight size={17} /></span></Link>
      <Link to="/login" className="role-choice-card"><span className="role-icon"><Code2 size={21} strokeWidth={1.6} /></span><strong>Find your next opportunity.</strong><p>Show what you do best and connect with companies looking for someone like you.</p><span className="role-action">I'm a developer <ArrowRight size={17} /></span></Link>
    </div><div className="start-review-strip"><ShieldCheck size={14} /><span>Every profile is reviewed, so you can connect with confidence.</span></div>
  </section></main>;
}

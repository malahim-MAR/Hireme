import { Link } from 'react-router-dom';
import './Footer.css';
export default function Footer() {
  return <footer className="tb-footer"><div className="tb-footer-container"><Link to="/" className="tb-footer-title">hireme.</Link><span>Good people. Great opportunities.</span><span className="tb-footer-copy">© {new Date().getFullYear()} HireMe</span></div></footer>;
}

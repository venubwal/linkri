const pageContent = {
    '#about': `
        <div class="page-container fade-in">
            <div class="page-header">
                <h2>About Linkri</h2>
                <p>Where Networks Create Careers</p>
            </div>
            <div class="page-body">
                <p>
                With over 20 years of experience in the technology industry, the founder created LinkRi with a simple vision: to help job seekers discover the best career opportunities through the power of trusted professional networks and corporate connections.<br><br>

Having worked closely with global organizations, hiring managers, engineering teams, and industry professionals, the founder recognized that many exceptional opportunities are never reached through traditional job portals alone. Strong networks, referrals, and professional relationships often play a crucial role in connecting the right talent with the right opportunity.<br><br>

At LinkRi, we believe that the best opportunities are found through meaningful connections. We are redefining how professionals discover, engage with, and secure rewarding career opportunities by leveraging the strength of corporate networks and professional communities.<br><br>

Whether you are an experienced professional, a recent graduate, or someone looking for the next step in your career journey, LinkRi provides a platform where connections create possibilities and networks open doors.<br><br>

Join our network today—because your next opportunity may already be within our network, which soon becomes your network.<br><br>

<b>LinkRi – Where Networks Create Careers</b>
                </p>
                <div class="features-grid" style="margin-top: 3rem;">
                    <div class="feature-card">
                        <div class="feature-icon">🌐</div>
                        <h3>Our Vision</h3>
                        <p>To create a boundaryless professional ecosystem where talent seamlessly meets opportunity through trusted referrals.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">🎯</div>
                        <h3>Our Mission</h3>
                        <p>To equip job seekers with high-fidelity tools, strategic profiles, and direct corporate access to accelerate their career trajectories.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon" style="background: transparent; border-radius: 0; padding: 0; width: 100%; height: auto; aspect-ratio: 16/9; overflow: hidden; margin-bottom: 1.5rem;">
                            <video id="about-what-we-do-video" src="data/LinkRi.mp4" autoplay loop playsinline style="width: 100%; height: 100%; object-fit: cover; border-radius: var(--radius);"></video>
                        </div>
                        <h3>What we do</h3>
                        <p>We connect you directly with internal decision makers and corporate employees to skip the application queue.</p>
                    </div>
                </div>
                <div class="about-stats-row" style="display: flex; justify-content: space-between; align-items: center; margin-top: 3rem; padding: 1rem; border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); font-weight: 600; font-size: 1.1rem; max-width: 600px; margin-left: auto; margin-right: auto;">
                    <div>Since 2022</div>
                    <div>Visitors: <span class="visitor-counter">1000</span></div>
                </div>
            </div>
        </div>
    `,
    '#why-us': `
        <div class="page-container fade-in">
            <div class="page-header">
                <h2>Why Choose Us</h2>
                <p>The Linkri Advantage</p>
            </div>
            <div class="page-body">
                <p>Linkri isn't just another job portal. We are your dedicated career growth partner. Our methodology bypasses the traditional resume black hole by directly bridging the gap between you and the hiring managers.</p>
                <ul class="styled-list">
                    <li><strong>Direct Access:</strong> Leverage our extensive employee network to get referred internally.</li>
                    <li><strong>Premium Branding:</strong> We craft resumes and profiles that stand out to ATS and human recruiters alike.</li>
                    <li><strong>Guaranteed Visibility:</strong> Our tailored approaches ensure your profile is always at the top of the recruiter's search.</li>
                </ul>
            </div>
        </div>
    `,
    '#resume-building': `
        <div class="page-container fade-in">
            <div class="page-header">
                <h2>Resume Building</h2>
                <p>Impress recruiters within 30 seconds</p>
            </div>
            <div class="page-body">
                <div class="service-highlight">
                    <div class="service-info">
                        <h3>Visual & ATS-Friendly Resumes</h3>
                        <p>Our expert writers design bespoke, high-impact resumes tailored to your specific industry. We balance striking visual design with critical keyword optimization to ensure you pass Applicant Tracking Systems (ATS) while captivating hiring managers.</p>
                        <a href="#contact-us" class="btn btn-primary" style="margin-top: 1rem;">Get Started - ₹6999</a>
                    </div>
                </div>
            </div>
        </div>
    `,
    '#linkedin-makeover': `
        <div class="page-container fade-in">
            <div class="page-header">
                <h2>LinkedIn Profile Makeover</h2>
                <p>Become a magnet for recruiters</p>
            </div>
            <div class="page-body">
                <p>Over 90% of recruiters use LinkedIn to scout top talent. We completely overhaul your profile—from a magnetic headline and compelling summary to strategic keyword placements—ensuring you rank higher in search results and attract inbound job offers.</p>
                <a href="#contact-us" class="btn btn-primary" style="margin-top: 2rem;">Optimize My Profile - ₹4999</a>
            </div>
        </div>
    `,
    '#profile-evaluation': `
        <div class="page-container fade-in">
            <div class="page-header">
                <h2>Profile Evaluation (Priority)</h2>
                <p>Instant insights into your job search</p>
            </div>
            <div class="page-body">
                <p>Not getting interview calls? Our experts will conduct a deep-dive audit of your current resume and LinkedIn profile, providing you with a comprehensive report of critical gaps, ATS failures, and actionable improvement strategies.</p>
                <a href="#contact-us" class="btn btn-primary" style="margin-top: 2rem;">Audit My Profile - ₹199</a>
            </div>
        </div>
    `,
    '#pro': `
        <div class="page-container fade-in">
            <div class="page-header">
                <h2>Employee Referral PRO</h2>
                <p>Skip the queue, get referred</p>
            </div>
            <div class="page-body">
                <p>Linkri PRO is our flagship referral service. We connect you directly with employees inside your dream companies. They review your profile and refer you internally, drastically increasing your chances of getting the interview call.</p>
                <a href="#contact-us" class="btn btn-primary" style="margin-top: 2rem;">Join PRO Network - from ₹4999</a>
            </div>
        </div>
    `,
    '#online-cv': `
        <div class="page-container fade-in">
            <div class="page-header">
                <h2>Online CV Hosting</h2>
                <p>Your resume, accessible anywhere</p>
            </div>
            <div class="page-body">
                <p>Get a customized URL (e.g., linkri.com/cv/yourname) hosting your beautifully formatted digital resume. Perfect for instant sharing on social media, networking events, or rapid application forms.</p>
            </div>
        </div>
    `,
    '#linkedin-recommendations': `
        <div class="page-container fade-in">
            <div class="page-header">
                <h2>LinkedIn Recommendations</h2>
                <p>Build instant authority</p>
            </div>
            <div class="page-body">
                <p>Profiles with strong recommendations are inherently trusted by recruiters. We help you draft 5 customized, highly professional recommendations that you can request from your colleagues and managers to boost your credibility.</p>
            </div>
        </div>
    `,
    '#naukri-makeover': `
        <div class="page-container fade-in">
            <div class="page-header">
                <h2>Naukri Profile Makeover</h2>
                <p>Rank #1 in recruiter searches</p>
            </div>
            <div class="page-body">
                <p>We optimize your Naukri profile with deeply researched, role-specific keywords. By structuring your skills and career history correctly, we ensure your profile appears on the first page when recruiters search for your skill set.</p>
            </div>
        </div>
    `,
    '#mock-interview': `
        <div class="page-container fade-in">
            <div class="page-header">
                <h2>Mock Interview</h2>
                <p>Practice makes perfect</p>
            </div>
            <div class="page-body">
                <p>Face an industry expert in a simulated interview environment. Receive brutally honest, constructive feedback on your body language, technical articulation, and behavioral responses before you face the real hiring manager.</p>
            </div>
        </div>
    `,
    '#interview-preparation': `
        <div class="page-container fade-in">
            <div class="page-header">
                <h2>Interview Preparation</h2>
                <p>Master the art of closing the deal</p>
            </div>
            <div class="page-body">
                <p>Our comprehensive interview coaching covers everything from the STAR method for behavioral questions to salary negotiation tactics. We train you to walk into any interview with absolute confidence.</p>
            </div>
        </div>
    `,
    '#services': `
        <div class="page-container fade-in">
            <div class="page-header">
                <h2>All-in-One Career Build</h2>
                <p>The ultimate career transformation</p>
            </div>
            <div class="page-body">
                <p>Why settle for one? Get our comprehensive package including Resume Building, LinkedIn Makeover, Naukri Optimization, and Interview Preparation at a bundled, highly discounted rate.</p>
            </div>
        </div>
    `,
    '#standards': `
        <div class="page-container fade-in">
            <div class="page-header">
                <h2>Industry Standard Parameters</h2>
                <p>Benchmark your career</p>
            </div>
            <div class="page-body">
                <p>We analyze your profile against the highest global industry standards, providing you a roadmap of certifications, skills, and experiences required to reach the top 1% of your field.</p>
            </div>
        </div>
    `,
    '#faq': `
        <div class="page-container fade-in">
            <div class="page-header">
                <h2>Frequently Asked Questions</h2>
                <p>We have the answers</p>
            </div>
            <div class="page-body">
                <div class="faq-list">
                    <div class="faq-item">
                        <h4>How does the Employee Referral PRO work?</h4>
                        <p>We match your profile with an existing employee in your target company. If your profile meets the mark, they refer you internally through their company portal.</p>
                    </div>
                    <div class="faq-item">
                        <h4>How long does Resume Building take?</h4>
                        <p>Our standard turnaround time is 3 to 5 business days, ensuring high quality and thorough ATS compliance checks.</p>
                    </div>
                </div>
            </div>
        </div>
    `,
    '#blog': `
        <div class="page-container fade-in">
            <div class="page-header">
                <h2>Linkri Blog</h2>
                <p>Insights, strategies, and career news</p>
            </div>
            <div class="page-body">
                <div class="features-grid">
                    <div class="feature-card">
                        <h3>5 Resume Mistakes to Avoid in 2026</h3>
                        <p>Discover the critical errors that are getting your resume rejected by modern ATS algorithms.</p>
                        <a href="#" class="btn btn-secondary" style="margin-top:1rem;">Read More</a>
                    </div>
                    <div class="feature-card">
                        <h3>Networking in the AI Era</h3>
                        <p>How to leverage artificial intelligence tools to build genuine, warm professional relationships.</p>
                        <a href="#" class="btn btn-secondary" style="margin-top:1rem;">Read More</a>
                    </div>
                </div>
            </div>
        </div>
    `,
    '#contact-us': `
        <div class="page-container fade-in">
            <div class="page-header">
                <h2>Contact Us</h2>
                <p>Let's build your future together</p>
            </div>
            <div class="page-body" style="max-width: 600px; margin: 0 auto;">
                <form class="contact-form" id="contact-form">
                    <div class="form-group">
                        <label>Name</label>
                        <input type="text" id="contact-name" name="name" placeholder="Your Full Name" required />
                    </div>
                    <div class="form-group">
                        <label>Mobile Number</label>
                        <input type="tel" id="contact-mobile" name="mobile" placeholder="Your Mobile Number" required />
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="contact-email" name="email" placeholder="you@example.com" required />
                    </div>
                    <div class="form-group">
                        <label>LinkedIn Profile <span style="font-size:0.8em; opacity:0.6;">(optional)</span></label>
                        <input type="url" id="contact-linkedin" name="linkedin_profile" placeholder="https://www.linkedin.com/in/your-profile" />
                    </div>
                    <div class="form-group">
                        <label>Naukri Profile <span style="font-size:0.8em; opacity:0.6;">(optional)</span></label>
                        <input type="url" id="contact-naukri" name="naukri_profile" placeholder="https://www.naukri.com/mnjuser/profile?id=your-id" />
                    </div>
                    <div class="form-group">
                        <label>Message</label>
                        <textarea id="contact-message" name="message" rows="4" placeholder="How can we help you?" required></textarea>
                    </div>
                    <button type="submit" id="contact-submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">Send Message</button>
                </form>
            </div>
        </div>
    `,
    '#404': `
        <div class="page-container fade-in" style="text-align: center;">
            <div class="page-header">
                <h2>Page Not Found</h2>
                <p>The content you are looking for does not exist.</p>
            </div>
            <a href="#home" class="btn btn-primary" style="margin-top: 2rem;">Return Home</a>
        </div>
    `
};

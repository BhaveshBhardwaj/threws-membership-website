import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const uri = process.env.MONGODB_URI;
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!uri) {
  console.error("Please define the MONGODB_URI environment variable inside .env.local");
  process.exit(1);
}

if (!adminEmail || !adminPassword) {
  console.error("Please define ADMIN_EMAIL and ADMIN_PASSWORD in .env.local to seed the admin user");
  process.exit(1);
}

async function seed() {
  const client = new MongoClient(uri as string);

  try {
    await client.connect();
    console.log("Connected to MongoDB...");
    
    const db = client.db();

    // 1. SEED ADMIN USER
    const usersCollection = db.collection("users");
    const existingAdmin = await usersCollection.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(adminPassword as string, salt);

      const newAdmin = {
        name: "Super Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "superadmin",
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await usersCollection.insertOne(newAdmin);
      console.log(`Successfully seeded superadmin with email: ${adminEmail}`);
    } else {
      console.log("Admin user already exists. Skip seeding admin.");
    }

    // 2. SEED HOME LAYOUT CMS SECTIONS
    console.log("Seeding Homepage CMS sections...");
    const cmsCollection = db.collection("cmssections");
    await cmsCollection.deleteMany({}); // Clean slate for cms sections to update properly

    const defaultSections = [
      {
        key: "hero",
        title: "Bridging University Theory and Corporate Employment",
        subtitle: "THREWS · Strengthen Educational Welfare Society · Est. 2013",
        content: "THREWS is registered under the Societies Registration Act (India, Act XXI of 1860). With 10,000+ global members and 500+ research papers, we advance research collaboration, academic networking, and structured Academic & Tech Projects (Tech, MBA, MCA).",
        image: "/images/hero_background.png",
        order: 1,
        isActive: true,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: "about",
        title: "New Era of Innovation Is Now Begun",
        subtitle: "The Research World — Founded in 2013",
        content: "Our Research Hub connects 5,000+ researchers, 500+ projects, and 1,000+ publications across 50+ countries. Pillars: Innovation, Collaboration, Excellence. Services include research consultation, publication support, data analysis, and research training.",
        image: "",
        order: 2,
        isActive: true,
        metadata: {
          counters: [
            { label: "Global Members", value: "10,000+" },
            { label: "Research Papers", value: "500+" },
            { label: "Partner Institutions", value: "100+" },
            { label: "Years of Presence", value: "12+" }
          ]
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: "stats",
        title: "THREWS By The Numbers",
        subtitle: "Milestones of Excellence",
        content: "Our metrics represent a global force of active researchers pushing the frontiers of engineering.",
        image: "",
        order: 3,
        isActive: true,
        metadata: {
          counters: [
            { label: "International Journals", value: "12" },
            { label: "Research Awards", value: "80+" },
            { label: "Patent Filings", value: "45+" },
            { label: "Total Citations", value: "12,000+" }
          ]
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await cmsCollection.insertMany(defaultSections);
    console.log("Successfully seeded CMS sections.");

    // 3. SEED PUBLICATIONS & PROJECTS (2022 to 2026)
    console.log("Seeding Publications & Projects...");
    const projectsCollection = db.collection("projects");
    await projectsCollection.deleteMany({});

    const defaultPublications = [
      {
        title: "A Deep Learning Paradigm for Extreme Weather Forecasting in Smart Grids",
        authors: "Dr. K. R. Anand, Prof. Sarah Jenkins",
        journal: "IEEE Transactions on Smart Grid",
        description: "This paper introduces a robust hybrid neural network system combining LSTM and Convolutional Layers to forecast extreme grid loads during meteorological anomalies. Evaluated across major urban centers, achieving a 98.4% predictive accuracy.",
        link: "https://ieeexplore.ieee.org",
        year: 2026,
        featured: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Blockchain-Enabled Decentralized Identity Protocols for Healthcare IoT Systems",
        authors: "Prof. Sarah Jenkins, Dr. Samuel Vance",
        journal: "International Journal of Electrical & Computer Engineering",
        description: "Focuses on providing immutable, decentralized cryptographic credentials for medical device telemetry, ensuring zero-trust security and complete compliance with health records protection standards.",
        link: "https://www.sciencedirect.com",
        year: 2025,
        featured: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "An Innovative Method for Soil Nutrient Estimation Using Multispectral Sensor Fusion",
        authors: "Dr. Manoj Gupta, R. S. Sinha, Prof. Anita Sharma",
        journal: "Springer Agritech and Sustainability Forum",
        description: "A breakthrough multispectral soil assay technique using fusion algorithms to detect nitrogen, phosphorus, and potassium levels in real-time without chemical extraction reagents, supporting sustainable farming paradigms.",
        link: "https://link.springer.com",
        year: 2024,
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Adaptive Congestion Handling Protocols in 5G Small Cell Networks",
        authors: "Prof. Anita Sharma, Dr. K. R. Anand",
        journal: "Westbridge Journal of Advanced Telecommunications",
        description: "Presents a novel heuristic load-balancer that dynamically shifts network streams across overlapping small cells using federated reinforcement learning, yielding a 40% reduction in packet drops during peak intervals.",
        link: "https://westbridgeresearch.org",
        year: 2023,
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Low-Power VLSI Architecture Design for Real-Time Edge Image Processing",
        authors: "Dr. Samuel Vance, Dr. Manoj Gupta",
        journal: "IEEE Circuits and Systems Conference",
        description: "A hardware-optimized implementation of standard image filters using dynamic voltage scaling. Reduces power consumption of AI microcontrollers by 60% with minimal processing overhead.",
        link: "https://ieeexplore.ieee.org",
        year: 2022,
        featured: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await projectsCollection.insertMany(defaultPublications);
    console.log("Successfully seeded publications.");

    // 4. SEED TIMELINE EVENTS, MILESTONES & ANNOUNCEMENTS
    console.log("Seeding Events and Milestones...");
    const eventsCollection = db.collection("events");
    await eventsCollection.deleteMany({});

    const defaultEvents = [
      {
        title: "Westbridge Annual Global Research Summit 2026",
        description: "Join us in New Delhi, India for our premier research symposium, focusing on artificial intelligence breakthroughs, ethical technology frameworks, and industrial collaborations.",
        date: new Date("2026-08-15"),
        location: "New Delhi, India / Hybrid",
        type: "event",
        image: "",
        link: "https://westbridgeresearch.org/summit2026",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Westbridge Research Honored with Institutional Scientific Excellence Award",
        description: "The National Council of Engineering and Research has recognized Westbridge Research for seminal contributions to sensor fusion and smart agriculture VLSI architectures across our fellow network.",
        date: new Date("2025-11-20"),
        location: "Mumbai, India",
        type: "achievement",
        image: "",
        link: "",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Westbridge Establishes 35th Collaborative Institutional Research Center",
        description: "We are excited to announce a new milestone: establishing a Joint AI and VLSI Lab in collaboration with prestigious technology universities to promote exchange of student researchers and joint patent filings.",
        date: new Date("2024-06-10"),
        location: "Bangalore, India",
        type: "collaboration",
        image: "",
        link: "",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Membership Tiers: Fellow, Honorary Fellow, Distinguished Fellow",
        description: "THREWS opens applications at $250 / $350 / $450 USD annually — Fellow Member, Honorary Fellow, and Distinguished Fellow tiers with committee review.",
        date: new Date("2023-01-05"),
        location: "Global",
        type: "milestone",
        image: "",
        link: "",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Announcing the Westbridge Journal of Digital Transformation",
        description: "Our peer-reviewed international scientific journal is officially open for manuscript submissions in areas of Industry 4.0, IoT networks, VLSI, and modern cybersecurity architectures.",
        date: new Date("2022-09-12"),
        location: "Academic Press",
        type: "announcement",
        image: "",
        link: "",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await eventsCollection.insertMany(defaultEvents);
    console.log("Successfully seeded timeline events.");

    // 5. SEED TESTIMONIALS & SPOTLIGHTS
    console.log("Seeding Testimonials...");
    const testimonialsCollection = db.collection("testimonials");
    await testimonialsCollection.deleteMany({});

    const defaultTestimonials = [
      {
        name: "Westbridge Research Collective",
        designation: "Institutional Leadership",
        institution: "Westbridge Research",
        text: "The Research World is a robust, dynamic collective. We are dedicated to providing deep scientific consulting, academic leadership, and engineering innovations that directly resolve real-world socio-economic challenges.",
        photoUrl: "",
        type: "spotlight",
        featured: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Prof. Clara Higgins",
        designation: "Dean of Engineering",
        institution: "Vance Institute of Tech",
        text: "Being a Senior Member of Westbridge has opened unparalleled avenues of peer review and industrial collaborations. Their publishing networks and research standards are truly premium and world-class.",
        photoUrl: "",
        type: "testimonial",
        featured: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Dr. Ramesh Iyer",
        designation: "Senior Scientist",
        institution: "National Agri-Tech Laboratories",
        text: "Our collaboration with Westbridge on the multispectral soil nutrient estimation project saved us months of development. The scientific precision of the research fellows is highly commendable.",
        photoUrl: "",
        type: "highlight",
        featured: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await testimonialsCollection.insertMany(defaultTestimonials);
    console.log("Successfully seeded testimonials.");

    // 6. SEED DIVERSIFIED BLOG ARTICLES SPANNING LAST 4 YEARS (2022 to 2026)
    console.log("Seeding rich blog articles (2022-2026)...");
    const blogCollection = db.collection("blogposts");
    await blogCollection.deleteMany({});

    const defaultBlogs = [
      {
        title: "Unlocking the Future of AI: Neuro-Symbolic Computing Paradigms",
        slug: "unlocking-future-ai-neuro-symbolic-computing",
        excerpt: "Discover how merging neural networks with symbolic logic will define the next generation of safe, explainable artificial intelligence.",
        content: `
          <p>Over the past decade, deep learning has revolutionized computer vision, natural language processing, and automated decision making. However, state-of-the-art deep networks suffer from key limitations: a lack of explainability, poor reasoning, and a high susceptibility to adversarial manipulation.</p>
          <h3>Enter Neuro-Symbolic AI</h3>
          <p>Neuro-symbolic computing is a pioneering paradigm that fuses the statistical learning capability of neural networks with the rigorous, logical reasoning of symbolic algorithms. By uniting these two schools of thought, we build systems that can learn from sparse data, represent complex concepts, and provide transparent explanations for their actions.</p>
          <p>Westbridge researchers note: <em>"We cannot achieve artificial general intelligence (AGI) purely by scaling compute. We must build hybrid architectures that can reason logically about what they learn statistically."</em></p>
          <h3>Key Applications</h3>
          <ul>
            <li><strong>Medical Diagnosis:</strong> Ensuring medical recommendations conform to standard healthcare guidelines and expert consensus.</li>
            <li><strong>Smart Grids:</strong> Providing transparent load distribution models that grid operators can inspect and trust.</li>
            <li><strong>Robotics:</strong> Safe spatial path-planning with rigorous geometric logical constraints.</li>
          </ul>
        `,
        coverImage: "",
        author: { name: "Westbridge Research", avatar: "" },
        tags: ["Artificial Intelligence", "Deep Learning", "Neuro-Symbolic"],
        category: "Artificial Intelligence",
        status: "published",
        publishedAt: new Date("2026-03-10"),
        views: 1240,
        createdAt: new Date("2026-03-10"),
        updatedAt: new Date("2026-03-10")
      },
      {
        title: "Sustainable Smart Agriculture: The Role of Internet of Things (IoT)",
        slug: "sustainable-smart-agriculture-role-of-iot",
        excerpt: "An in-depth look at how multispectral sensors and IoT gateways are transforming smallholder farming yield and resource conservation.",
        content: `
          <p>Agriculture is facing a perfect storm of climate variability, resource scarcity, and rising global populations. Sustainable farming is no longer a luxury—it is an absolute survival imperative. Internet of Things (IoT) technologies are providing farmers with real-time, actionable insights to optimize resource usage.</p>
          <h3>Dynamic Sensor Fusion</h3>
          <p>By deploying low-power, multispectral sensor networks across crop fields, Westbridge researchers have engineered systems that measure soil moisture, dynamic nutrient content (NPK), and ambient humidity in real-time. These metrics are transmitted via LoRaWAN gateways to localized dashboards.</p>
          <p>This allows farmers to apply fertilizers and water only where needed, cutting input costs by 35% and preventing groundwater contamination.</p>
        `,
        coverImage: "",
        author: { name: "Dr. Manoj Gupta", avatar: "" },
        tags: ["IoT", "Smart Agriculture", "Sensor Fusion"],
        category: "IoT & Sensors",
        status: "published",
        publishedAt: new Date("2025-09-18"),
        views: 950,
        createdAt: new Date("2025-09-18"),
        updatedAt: new Date("2025-09-18")
      },
      {
        title: "Securing Edge Telemetry: Decentralized Blockchain Architectures",
        slug: "securing-edge-telemetry-decentralized-blockchain",
        excerpt: "Explaining how public/private blockchain hybrids protect critical industrial IoT telemetry networks from cyber infiltration.",
        content: `
          <p>The explosive proliferation of edge computing devices has dramatically expanded the attack surface for critical infrastructure. Modern hackers target IoT devices to infiltrate smart grids and water treatment plants. Classical centralized security frameworks cannot scale to meet these risks.</p>
          <h3>Immutability at the Edge</h3>
          <p>By deploying lightweight, consensus-driven blockchain nodes directly on edge gateways, we can cryptographically secure the device telemetry. Each telemetry packet is signed and stored as an immutable block, preventing spoofing and man-in-the-middle attacks.</p>
        `,
        coverImage: "",
        author: { name: "Prof. Sarah Jenkins", avatar: "" },
        tags: ["Cybersecurity", "Blockchain", "Edge Computing"],
        category: "Cybersecurity",
        status: "published",
        publishedAt: new Date("2025-02-14"),
        views: 810,
        createdAt: new Date("2025-02-14"),
        updatedAt: new Date("2025-02-14")
      },
      {
        title: "Energy Trading Paradigms in Microgrids Using Smart Contracts",
        slug: "energy-trading-microgrids-smart-contracts",
        excerpt: "How local microgrids can share solar and wind power automatically using Ethereum-based secure smart contracts.",
        content: `
          <p>Decentralized energy resources like solar arrays and localized wind farms are turning consumers into 'prosumers'—active producers who can feed energy back into the power grid. A decentralized microgrid enables automated, peer-to-peer energy transactions, bypassing centralized utility providers.</p>
          <p>Westbridge projects in VLSI smart meters have implemented automatic ledger logging, enabling smart contracts to settle energy trades in milliseconds.</p>
        `,
        coverImage: "",
        author: { name: "Prof. Sarah Jenkins", avatar: "" },
        tags: ["Smart Grids", "Smart Contracts", "Energy"],
        category: "Smart Grids",
        status: "published",
        publishedAt: new Date("2024-10-05"),
        views: 740,
        createdAt: new Date("2024-10-05"),
        updatedAt: new Date("2024-10-05")
      },
      {
        title: "Low-Power VLSI Architectures for TinyML Deployments",
        slug: "low-power-vlsi-architectures-tinyml",
        excerpt: "An architectural review of circuit designs that allow machine learning models to run on milliwatt-scale microchips.",
        content: `
          <p>Running neural networks on edge devices has historically been bottlenecked by processing energy. TinyML requires specialized VLSI hardware optimized for matrix math under strict battery limits.</p>
          <p>By implementing dynamic voltage frequency scaling (DVFS) and zero-weight pruning directly into silicon, Westbridge VLSI Labs have pioneered microchip architectures that run image classification under 5 milliwatts.</p>
        `,
        coverImage: "",
        author: { name: "Dr. Samuel Vance", avatar: "" },
        tags: ["VLSI", "TinyML", "Microchip Design"],
        category: "VLSI & Hardware",
        status: "published",
        publishedAt: new Date("2024-04-22"),
        views: 680,
        createdAt: new Date("2024-04-22"),
        updatedAt: new Date("2024-04-22")
      },
      {
        title: "Pioneering the LoRaWAN Protocols for Rural Health Telemetry",
        slug: "lorawan-protocols-rural-health-telemetry",
        excerpt: "Addressing the digital divide in rural patient monitoring using low-frequency long-range network transmission protocols.",
        content: `
          <p>Rural clinics face a lack of standard broadband infrastructure. By deploying long-range LoRaWAN telemetry arrays, health workers can transmit vital patient ECG and blood-oxygen metrics over 15 kilometers without cellular signal.</p>
        `,
        coverImage: "",
        author: { name: "Dr. Manoj Gupta", avatar: "" },
        tags: ["LoRaWAN", "Health Tech", "Rural Telemetry"],
        category: "Telecommunications",
        status: "published",
        publishedAt: new Date("2023-11-12"),
        views: 590,
        createdAt: new Date("2023-11-12"),
        updatedAt: new Date("2023-11-12")
      },
      {
        title: "A Survey of 5G Congestion Protocols and Beamforming Tech",
        slug: "survey-5g-congestion-beamforming",
        excerpt: "Understanding how adaptive phased antenna arrays mitigate cell signal drops in high-density urban environments.",
        content: `
          <p>High frequencies in 5G cellular communication struggle with physical obstructions. Beamforming dynamically directs signals to active users instead of broadcasting broadly, reducing inter-cell interference.</p>
        `,
        coverImage: "",
        author: { name: "Prof. Anita Sharma", avatar: "" },
        tags: ["5G", "Telecommunications", "Beamforming"],
        category: "Telecommunications",
        status: "published",
        publishedAt: new Date("2023-05-30"),
        views: 520,
        createdAt: new Date("2023-05-30"),
        updatedAt: new Date("2023-05-30")
      },
      {
        title: "Establishing the Foundations of Scientific Peer Research in India",
        slug: "establishing-foundations-scientific-peer-research",
        excerpt: "A historical retrospective on the inception of the Westbridge Research Syndicate in 2013, bridging local science to global forums.",
        content: `
          <p>Westbridge was founded in 2013 with a simple, powerful vision: to provide local scientists, academic professors, and independent inventors in India with an accredited channel to collaborate with international research labs.</p>
          <p>The collective was established as a corporate-scientific joint hub, championing open science, fast-tracked patent publication, and robust peer mentorship.</p>
        `,
        coverImage: "",
        author: { name: "Westbridge Research", avatar: "" },
        tags: ["Open Science", "Academics", "Westbridge History"],
        category: "Community & Vision",
        status: "published",
        publishedAt: new Date("2022-08-01"),
        views: 1150,
        createdAt: new Date("2022-08-01"),
        updatedAt: new Date("2022-08-01")
      }
    ];

    await blogCollection.insertMany(defaultBlogs);
    console.log("Successfully seeded 8+ diversified blog articles spanning 2022 to 2026.");

    // 7. SEED HALL OF FAME (static roster reference in CMS)
    console.log("Seeding Hall of Fame entries...");
    const hofCollection = db.collection("halloffames");
    await hofCollection.deleteMany({});
    const hallOfFameEntries = [
      { name: "Arun Kumar Reddy Goli", tier: "distinguished_fellow", designation: "Cloud/SRE DevOps", bio: "AWS, Azure, GCP, AI", order: 1 },
      { name: "Satish Reddy Goli", tier: "distinguished_fellow", designation: "Cloud & DevOps", bio: "Fintech CI/CD, AI", order: 2 },
      { name: "Meet Patel", tier: "distinguished_fellow", designation: "Data Engineering/ML", bio: "Comcast, Spark, Databricks, PyTorch", order: 3 },
      { name: "Nikita Chawla", tier: "distinguished_fellow", designation: "Agile/SAFe", bio: "Fidelity, -20% delivery improvement", order: 4 },
      { name: "Rakesh Konda", tier: "distinguished_fellow", designation: "Integration", bio: "MuleSoft/Snowflake, 8+ years", order: 5 },
      { name: "Deepak Singh", tier: "distinguished_fellow", designation: "Cloud-Native", bio: "19+ years, NLP, GenAI", order: 6 },
      { name: "Rahul Bhatia", tier: "distinguished_fellow", designation: "SAP S/4 HANA Finance", bio: "18+ years", order: 7 },
      { name: "Pathik Bavadiya", tier: "fellow", designation: "K8s, Terraform", bio: "5+ years", order: 8 },
      { name: "Vijayendra V Rao", tier: "fellow", designation: "Supply Chain/Commerce", bio: "20+ years", order: 9 },
    ].map((e) => ({ ...e, featured: true, createdAt: new Date(), updatedAt: new Date() }));
    await hofCollection.insertMany(hallOfFameEntries);
    console.log("Successfully seeded Hall of Fame (9 members).");

  } catch (error) {
    console.error("Error seeding the database:", error);
  } finally {
    await client.close();
    console.log("Disconnected from MongoDB.");
  }
}

seed();

import Footer from "@/components/footer";
import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import {
  ArrowUpRight,
  CheckCircle2,
  Search,
  FileText,
  BriefcaseBusiness,
  Sparkles,
  LineChart,
  Clock,
} from "lucide-react";
import { createClient } from "../../supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      <Hero />

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              How Our AI Job Finder Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our intelligent platform streamlines your job search with powerful
              AI technology and intuitive tools.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Sparkles className="w-6 h-6" />,
                title: "AI-Powered Search",
                description:
                  "Our AI scans multiple job platforms simultaneously to find all available opportunities",
              },
              {
                icon: <LineChart className="w-6 h-6" />,
                title: "Smart Recommendations",
                description:
                  "Machine learning algorithms analyze your profile to suggest the most relevant positions",
              },
              {
                icon: <FileText className="w-6 h-6" />,
                title: "Real-Time Updates",
                description:
                  "Get instant notifications when new jobs matching your criteria are posted",
              },
              {
                icon: <Clock className="w-6 h-6" />,
                title: "Advanced Filtering",
                description:
                  "Filter by salary, location, company type, remote options, and more",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-blue-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Your Intelligent Job Search Journey
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform transforms how you find and apply for jobs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Search className="w-10 h-10" />,
                title: "1. Multi-Platform Scanning",
                description:
                  "Our AI engine continuously crawls LinkedIn, Indeed, Naukri, and other job boards to aggregate all available opportunities in one place.",
              },
              {
                icon: <BriefcaseBusiness className="w-10 h-10" />,
                title: "2. Intelligent Matching",
                description:
                  "Machine learning algorithms analyze your profile, skills, and preferences to rank jobs based on relevance and potential fit.",
              },
              {
                icon: <LineChart className="w-10 h-10" />,
                title: "3. Continuous Learning",
                description:
                  "Our AI improves recommendations based on your interactions, application history, and feedback to deliver increasingly relevant opportunities.",
              },
            ].map((step, index) => (
              <div
                key={index}
                className="p-8 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow text-center"
              >
                <div className="text-blue-600 mb-6 mx-auto">{step.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Personalized Recommendations Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-6">
                Personalized Job Recommendations
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Our advanced machine learning algorithms analyze your unique
                profile, skills, experience, and preferences to deliver highly
                personalized job recommendations.
              </p>
              <ul className="space-y-4">
                {[
                  "Skills-based matching that understands your expertise",
                  "Salary optimization based on market trends and your experience",
                  "Location intelligence with commute time analysis",
                  "Company culture matching based on your preferences",
                  "Career growth potential assessment",
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:w-1/2 bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-xl shadow-lg">
              <div className="bg-white rounded-lg p-6 shadow-sm mb-4">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <BriefcaseBusiness className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Senior Software Engineer</h3>
                    <p className="text-sm text-gray-500">
                      TechCorp Inc. • Remote
                    </p>
                  </div>
                  <div className="ml-auto bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    98% Match
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Perfect match for your React and Node.js skills with
                  competitive salary range.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <BriefcaseBusiness className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Product Manager</h3>
                    <p className="text-sm text-gray-500">
                      InnovateCo • San Francisco
                    </p>
                  </div>
                  <div className="ml-auto bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    92% Match
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Aligns with your product development experience and leadership
                  skills.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">100,000+</div>
              <div className="text-blue-100">Job Listings</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">15+</div>
              <div className="text-blue-100">Job Platforms</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">92%</div>
              <div className="text-blue-100">Match Accuracy</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">25,000+</div>
              <div className="text-blue-100">Happy Job Seekers</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Find Your Dream Job?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of successful job seekers who found their perfect
            position using our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/sign-up"
              className="inline-flex items-center px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Free Account
              <ArrowUpRight className="ml-2 w-4 h-4" />
            </a>
            <a
              href="/sign-in"
              className="inline-flex items-center px-6 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

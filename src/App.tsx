import ReviewSubmissionForm from "./components/ReviewSubmissionForm";
import CustomerReviews from "./components/CustomerReviews";

function App() {
  const sampleReviews = [
    {
      id: 1,
      rating: 5,
      title: "Outstanding Quality",
      message:
        "The attention to detail and quality of work exceeded my expectations. I will definitely be using their services again.",
      customerName: "Emily Rodriguez",
      // The photoUrl property is now completely removed from this object
    },
    {
      id: 2,
      rating: 5,
      title: "Highly Professional",
      message:
        "From the initial consultation to the final delivery, everything was handled with utmost professionalism.",
      customerName: "Lisa Andersen",
      photoUrl: "https://i.pravatar.cc/150?u=lisa",
    },
    {
      id: 3,
      rating: 4,
      title: "Great Experience Overall",
      message:
        "Had a wonderful experience from start to finish. The staff was knowledgeable and helpful throughout the entire process.",
      customerName: "Michael Chen",
      photoUrl: "https://i.pravatar.cc/150?u=michael",
    },
  ];

  return (
    <div>
      <ReviewSubmissionForm />
      <div className="my-8"></div> {/* A little space between components */}
      <CustomerReviews reviews={sampleReviews} />
    </div>
  );
}

export default App;

import torch
from torch.utils.data import DataLoader
from pathlib import Path

from diabetes_model import DiabetesModel
from dataset import DiabetesDataset

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
WEIGHTS_PATH = PROJECT_ROOT / "ml" / "weights" / "best_model.pt"
DATA_PATH = PROJECT_ROOT / "data"
TEST_PATH = DATA_PATH / "test.csv"


def evaluate():
    model = DiabetesModel()
    model.load_state_dict(torch.load(WEIGHTS_PATH, weights_only=True))
    model.eval()

    test_dataset = DiabetesDataset(TEST_PATH)
    test_loader = DataLoader(test_dataset, batch_size=32, shuffle=False)

    print("THE BEGINNING OF MODEL TEST")

    correct = 0
    total = 0

    true_positives = 0
    true_negatives = 0
    false_positives = 0
    false_negatives = 0

    with torch.no_grad():
        for inputs, labels in test_loader:
            outputs = model(inputs)
            predicted = (outputs > 0.0).float()

            total += labels.size(0)
            correct += (predicted == labels).sum().item()

            # the confusion matrix
            for i in range(len(labels)):
                pred = predicted[i].item()
                actual = labels[i].item()

                if actual == 1 and pred == 1:
                    true_positives += 1
                elif actual == 0 and pred == 0:
                    true_negatives += 1
                elif actual == 0 and pred == 1:
                    false_positives += 1
                elif actual == 1 and pred == 0:
                    false_negatives += 1

    accuracy = 100 * correct / total

    print(f"Overall Accuracy: {accuracy:.1f}%\n")
    print(f"True Positives (TP): {true_positives}")
    print(f"True Negatives (TN): {true_negatives}")
    print(f"False Positives (FP - False Alarm): {false_positives}")
    print(f"False Negatives (FN - MISSED PATIENTS): {false_negatives}")


if __name__ == "__main__":
    evaluate()
